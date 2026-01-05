from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.db import models
import json
from .models import Card, List
from .serializers import CardSerializer

class BoardConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.board_id = self.scope['url_route']['kwargs']['board_id']
        self.group_name = f'board_{self.board_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f'Client connected to board {self.board_id}')

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print(f'Client disconnected from board {self.board_id}')

    async def receive_json(self, content, **kwargs):
        """Handle incoming messages from clients"""
        message_type = content.get('type')
        
        if message_type == 'card_moved':
            await self.handle_card_moved(content)
        elif message_type == 'card_updated':
            await self.handle_card_updated(content)
        elif message_type == 'card_created':
            await self.handle_card_created(content)
        elif message_type == 'card_deleted':
            await self.handle_card_deleted(content)

    async def handle_card_moved(self, content):
        """Handle card drag-and-drop"""
        try:
            card_id = content.get('card_id')
            list_id = content.get('list_id')
            position = content.get('position', 0)
            
            card = await self.update_card_position(card_id, list_id, position)
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'board_update',
                    'message': {
                        'event': 'card_moved',
                        'card': await self.serialize_card(card),
                    }
                }
            )
        except Exception as e:
            print(f'Error handling card_moved: {e}')

    async def handle_card_updated(self, content):
        """Handle card title/description updates"""
        try:
            card_id = content.get('card_id')
            title = content.get('title')
            description = content.get('description', '')
            
            card = await self.update_card_fields(card_id, title, description)
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'board_update',
                    'message': {
                        'event': 'card_updated',
                        'card': await self.serialize_card(card),
                    }
                }
            )
        except Exception as e:
            print(f'Error handling card_updated: {e}')

    async def handle_card_created(self, content):
        """Handle new card creation"""
        try:
            list_id = content.get('list_id')
            title = content.get('title', 'Untitled Card')
            
            card = await self.create_card(list_id, title)
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'board_update',
                    'message': {
                        'event': 'card_created',
                        'card': await self.serialize_card(card),
                    }
                }
            )
        except Exception as e:
            print(f'Error handling card_created: {e}')

    async def handle_card_deleted(self, content):
        """Handle card deletion"""
        try:
            card_id = content.get('card_id')
            await self.delete_card(card_id)
            
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'board_update',
                    'message': {
                        'event': 'card_deleted',
                        'card_id': card_id,
                    }
                }
            )
        except Exception as e:
            print(f'Error handling card_deleted: {e}')

    async def board_update(self, event):
        """Broadcast updates to all clients in the group"""
        await self.send_json(event['message'])

    @database_sync_to_async
    def update_card_position(self, card_id, list_id, position):
        card = Card.objects.get(id=card_id)
        card.list_id = list_id
        card.position = position
        card.save()
        return card

    @database_sync_to_async
    def update_card_fields(self, card_id, title, description):
        card = Card.objects.get(id=card_id)
        card.title = title
        card.description = description
        card.save()
        return card

    @database_sync_to_async
    def create_card(self, list_id, title):
        list_obj = List.objects.get(id=list_id)
        max_position = list_obj.cards.aggregate(models.Max('position'))['position__max'] or -1
        card = Card.objects.create(
            list=list_obj,
            title=title,
            position=max_position + 1
        )
        return card

    @database_sync_to_async
    def delete_card(self, card_id):
        Card.objects.filter(id=card_id).delete()

    @database_sync_to_async
    def serialize_card(self, card):
        return CardSerializer(card).data

from django.core.management.base import BaseCommand
from core.models import Board, List, Card

class Command(BaseCommand):
    help = 'Populate database with sample board, lists, and cards'

    def handle(self, *args, **options):
        # Create or get board
        board, created = Board.objects.get_or_create(
            title='Sample Project Board',
            defaults={}
        )
        
        # Create lists
        todo_list, _ = List.objects.get_or_create(board=board, title='To Do', position=0)
        in_progress, _ = List.objects.get_or_create(board=board, title='In Progress', position=1)
        done, _ = List.objects.get_or_create(board=board, title='Done', position=2)
        
        # Create cards for To Do
        Card.objects.get_or_create(list=todo_list, title='Implement authentication', position=0)
        Card.objects.get_or_create(list=todo_list, title='Add drag-and-drop', position=1)
        Card.objects.get_or_create(list=todo_list, title='Deploy to production', position=2)
        
        # Create cards for In Progress
        Card.objects.get_or_create(list=in_progress, title='Build React UI', position=0)
        Card.objects.get_or_create(list=in_progress, title='WebSocket integration', position=1)
        
        # Create cards for Done
        Card.objects.get_or_create(list=done, title='Project setup', position=0)
        Card.objects.get_or_create(list=done, title='Django models', position=1)
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database'))

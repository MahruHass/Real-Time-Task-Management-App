from rest_framework import serializers
from .models import Board, List, Card, Comment
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'card', 'author', 'text', 'created_at', 'updated_at']

class CardSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    assigned_to = UserSerializer(read_only=True)
    
    class Meta:
        model = Card
        fields = ['id', 'list', 'title', 'description', 'position', 'due_date', 'assigned_to', 'comments', 'created_at', 'updated_at']

class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    
    class Meta:
        model = List
        fields = ['id', 'board', 'title', 'position', 'cards']

class BoardSerializer(serializers.ModelSerializer):
    lists = ListSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Board
        fields = ['id', 'title', 'owner', 'lists', 'created_at']

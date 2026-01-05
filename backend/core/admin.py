from django.contrib import admin
from .models import Board, List, Card, Comment

@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_at')

@admin.register(List)
class ListAdmin(admin.ModelAdmin):
    list_display = ('title', 'board', 'position')

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('title', 'list', 'assigned_to', 'due_date', 'position', 'created_at')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'card', 'created_at')

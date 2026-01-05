from django.db import models
from django.contrib.auth.models import User

class Board(models.Model):
    title = models.CharField(max_length=200)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='boards', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class List(models.Model):
    board = models.ForeignKey(Board, related_name='lists', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    position = models.IntegerField(default=0)

    def __str__(self):
        return self.title

class Card(models.Model):
    list = models.ForeignKey(List, related_name='cards', on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    position = models.IntegerField(default=0)
    due_date = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_cards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    card = models.ForeignKey(Card, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.card.title}"

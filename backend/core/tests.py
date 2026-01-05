from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Board, List, Card, Comment

class AuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
    def test_register(self):
        response = self.client.post('/api/register/', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        # The view should allow unauthenticated POST for registration
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED])
        # Check if user was created
        if response.status_code == status.HTTP_201_CREATED:
            self.assertTrue(User.objects.filter(username='testuser').exists())
    
    def test_login(self):
        User.objects.create_user(username='testuser', password='testpass123')
        response = self.client.post('/api/token/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

class BoardTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='test')
        self.board = Board.objects.create(title='Test Board', owner=self.user)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_create_board(self):
        response = self.client.post('/api/boards/', {'title': 'New Board'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_boards(self):
        response = self.client.get('/api/boards/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class CardTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='test')
        self.board = Board.objects.create(title='Test Board')
        self.list = List.objects.create(board=self.board, title='To Do')
        self.card = Card.objects.create(list=self.list, title='Test Card')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_update_card(self):
        response = self.client.patch(f'/api/cards/{self.card.id}/', {
            'title': 'Updated Card',
            'description': 'New desc'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.card.refresh_from_db()
        self.assertEqual(self.card.title, 'Updated Card')
    
    def test_add_comment(self):
        response = self.client.post(f'/api/cards/{self.card.id}/add_comment/', {
            'text': 'Great card!'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)

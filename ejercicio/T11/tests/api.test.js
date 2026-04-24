import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import prisma from '../src/config/prisma.js';
import app from '../src/app.js';

const state = {
  stamp: String(Date.now()).slice(-8),
  adminToken: '',
  librarianToken: '',
  userToken: '',
  userId: null,
  bookId: null,
  reviewId: null,
  loanId: null,
};

const authHeader = (token) => `Bearer ${token}`;

beforeAll(async () => {
  const librarianLogin = await request(app).post('/api/auth/login').send({
    email: 'librarian@library.test',
    password: 'Library1234',
  });

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@library.test',
    password: 'Admin1234',
  });

  const userRegister = await request(app).post('/api/auth/register').send({
    name: `Jest User ${state.stamp}`,
    email: `jest${state.stamp}@example.com`,
    password: 'Reader1234',
  });

  state.librarianToken = librarianLogin.body.token;
  state.adminToken = adminLogin.body.token;
  state.userToken = userRegister.body.token;
  state.userId = userRegister.body.user.id;
});

afterAll(async () => {
  if (state.reviewId) {
    await prisma.review.deleteMany({
      where: {
        id: state.reviewId,
      },
    });
  }

  if (state.loanId) {
    await prisma.loan.deleteMany({
      where: {
        id: state.loanId,
      },
    });
  }

  if (state.bookId) {
    await prisma.book.deleteMany({
      where: {
        id: state.bookId,
      },
    });
  }

  if (state.userId) {
    await prisma.user.deleteMany({
      where: {
        id: state.userId,
      },
    });
  }

  await prisma.$disconnect();
});

describe('library api', () => {
  test('serves swagger json', async () => {
    const response = await request(app).get('/api-docs.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
  });

  test('returns current user profile', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', authHeader(state.userToken));

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(`jest${state.stamp}@example.com`);
  });

  test('enforces role restrictions for book creation', async () => {
    const response = await request(app)
      .post('/api/books')
      .set('Authorization', authHeader(state.userToken))
      .send({
        isbn: `978${state.stamp}00`,
        title: 'Forbidden',
        author: 'Forbidden',
        genre: 'Forbidden',
        publishedYear: 2024,
        copies: 1,
        available: 1,
      });

    expect(response.status).toBe(403);
  });

  test('supports book CRUD, filters, pagination and stats', async () => {
    const created = await request(app)
      .post('/api/books')
      .set('Authorization', authHeader(state.librarianToken))
      .send({
        isbn: `978${state.stamp}11`,
        title: 'Jest Book',
        author: 'Jest Author',
        genre: 'Jest Genre',
        publishedYear: 2024,
        copies: 2,
        available: 2,
      });

    state.bookId = created.body.data.id;

    expect(created.status).toBe(201);

    const list = await request(app).get('/api/books').query({
      genre: 'Jest Genre',
      available: 'true',
      page: 1,
      limit: 10,
    });

    expect(list.status).toBe(200);
    expect(list.body.pagination.page).toBe(1);
    expect(list.body.data.some((book) => book.id === state.bookId)).toBe(true);

    const updated = await request(app)
      .put(`/api/books/${state.bookId}`)
      .set('Authorization', authHeader(state.librarianToken))
      .send({
        genre: 'Updated Genre',
        copies: 3,
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.genre).toBe('Updated Genre');
    expect(updated.body.data.available).toBe(3);

    const stats = await request(app)
      .get('/api/books/stats')
      .set('Authorization', authHeader(state.librarianToken))
      .query({ limit: 5 });

    expect(stats.status).toBe(200);
    expect(stats.body.data.totals.books).toBeGreaterThan(0);
    expect(Array.isArray(stats.body.data.mostBorrowed)).toBe(true);
    expect(Array.isArray(stats.body.data.topRated)).toBe(true);
  });

  test('supports loan and review flow', async () => {
    const loan = await request(app)
      .post('/api/loans')
      .set('Authorization', authHeader(state.userToken))
      .send({
        bookId: state.bookId,
      });

    state.loanId = loan.body.data.id;

    expect(loan.status).toBe(201);
    expect(loan.body.data.book.available).toBe(2);

    const duplicateLoan = await request(app)
      .post('/api/loans')
      .set('Authorization', authHeader(state.userToken))
      .send({
        bookId: state.bookId,
      });

    expect(duplicateLoan.status).toBe(400);

    const reviewBeforeReturn = await request(app)
      .post(`/api/books/${state.bookId}/reviews`)
      .set('Authorization', authHeader(state.userToken))
      .send({
        rating: 4,
        comment: 'Too early',
      });

    expect(reviewBeforeReturn.status).toBe(400);

    const returned = await request(app)
      .put(`/api/loans/${state.loanId}/return`)
      .set('Authorization', authHeader(state.userToken));

    expect(returned.status).toBe(200);
    expect(returned.body.data.status).toBe('RETURNED');
    expect(returned.body.data.book.available).toBe(3);

    const review = await request(app)
      .post(`/api/books/${state.bookId}/reviews`)
      .set('Authorization', authHeader(state.userToken))
      .send({
        rating: 5,
        comment: 'Great',
      });

    state.reviewId = review.body.data.id;

    expect(review.status).toBe(201);

    const duplicateReview = await request(app)
      .post(`/api/books/${state.bookId}/reviews`)
      .set('Authorization', authHeader(state.userToken))
      .send({
        rating: 4,
        comment: 'Again',
      });

    expect(duplicateReview.status).toBe(409);

    const reviews = await request(app).get(`/api/books/${state.bookId}/reviews`);

    expect(reviews.status).toBe(200);
    expect(reviews.body.summary.totalReviews).toBe(1);

    const foreignUser = await request(app).post('/api/auth/register').send({
      name: `Foreign ${state.stamp}`,
      email: `foreign${state.stamp}@example.com`,
      password: 'Reader1234',
    });

    const foreignToken = foreignUser.body.token;
    const foreignId = foreignUser.body.user.id;

    const forbiddenDelete = await request(app)
      .delete(`/api/reviews/${state.reviewId}`)
      .set('Authorization', authHeader(foreignToken));

    expect(forbiddenDelete.status).toBe(403);

    await prisma.user.delete({
      where: {
        id: foreignId,
      },
    });

    const ownDelete = await request(app)
      .delete(`/api/reviews/${state.reviewId}`)
      .set('Authorization', authHeader(state.userToken));

    expect(ownDelete.status).toBe(200);
    state.reviewId = null;
  });
});

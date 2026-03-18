/**
 * MSW request handlers for API mocking.
 * Provides default mock responses for core API endpoints.
 */

import { http, HttpResponse } from "msw";

// Use a base URL that matches the dev environment
const API_BASE = "https://h92rez0gq8.execute-api.us-east-2.amazonaws.com/dev";

export const handlers = [
  // ---- Courses ----
  http.get(`${API_BASE}/courses`, () => {
    return HttpResponse.json([
      {
        id: "course-1",
        name: "Introduction to CS",
        faculty: "Computer Science",
        year: "2025",
        status: "active",
        courseType: "regular",
        sessions: [],
        studentsCount: 30,
      },
      {
        id: "course-2",
        name: "Data Structures",
        faculty: "Computer Science",
        year: "2025",
        status: "active",
        courseType: "regular",
        sessions: [],
        studentsCount: 25,
      },
    ]);
  }),

  http.get(`${API_BASE}/courses/:courseId`, ({ params }) => {
    return HttpResponse.json({
      id: params.courseId,
      name: "Introduction to CS",
      faculty: "Computer Science",
      year: "2025",
      status: "active",
      courseType: "regular",
    });
  }),

  // ---- Sessions ----
  http.post(`${API_BASE}/sessions/start`, () => {
    return HttpResponse.json({
      id: "session-1",
      shortId: "ABC123",
      status: "active",
      begins: Date.now(),
    });
  }),

  http.post(`${API_BASE}/sessions/updatecodes`, () => {
    return HttpResponse.json({ checkins: 5 });
  }),

  // ---- Students ----
  http.get(`${API_BASE}/courses/:courseId/students`, () => {
    return HttpResponse.json([
      {
        id: "student-1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
      },
      {
        id: "student-2",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        phone: "+1234567891",
      },
    ]);
  }),

  // ---- Admin ----
  http.get(`${API_BASE}/admin/stats`, () => {
    return HttpResponse.json({
      totalHosts: 100,
      totalCourses: 500,
      totalSessions: 2000,
      totalAttendees: 10000,
    });
  }),

  // ---- Auth (mock) ----
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({
      token: "mock-jwt-token",
      user: {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      },
    });
  }),
];

# DairyFarm App - Income Management

This Readme file provides an overview of the Income Management feature within the DairyFarm App, specifically covering the `src/app/income` directory which handles viewing, adding, editing, and deleting income records.

## Table of Contents

  * [Overview](https://www.google.com/search?q=%23overview)
  * [Features](https://www.google.com/search?q=%23features)
  * [Components](https://www.google.com/search?q=%23components)
  * [API Endpoints](https://www.google.com/search?q=%23api-endpoints)
  * [Error Handling](https://www.google.com/search?q=%23error-handling)
  * [Getting Started](https://www.google.com/search?q=%23getting-started)

## Overview

The Income Management section of the DairyFarm App allows users to keep track of various income sources related to their dairy farm operations. Users can add new income records, view a list of all existing records, and modify or remove them as needed. The application ensures data integrity and provides user-friendly feedback for various operations.

## Features

  * **View Income Records**: Display a paginated list of all income records.
  * **Add New Income**: Form to input details for new income records, including source, amount, date, and notes.
  * **Edit Existing Income**: Modify details of an existing income record.
  * **Delete Income Records**: Remove unwanted income records.
  * **Authentication Protected**: All income operations require user authentication.
  * **Client-Side Validation**: Basic validation for required fields before submission.
  * **Responsive Design**: Optimized for various screen sizes.
  * **Toast Notifications**: Provides real-time feedback to the user for success or error messages.

## Components

### `src/app/income/page.tsx`

This is the main page for displaying and managing income records.

  * **State Management**: Uses `useState` hooks for managing income records, loading states, and errors.
  * **Authentication Check**: On mount, it checks for user authentication and redirects to `/login` if the user is not authenticated.
  * **Data Fetching**: Utilizes `useEffect` to fetch income records from the `/api/income` endpoint using the `authFetch` utility from `AuthContext`.
  * **Error Handling**: Catches errors during data fetching and displays appropriate toast notifications and error messages. It specifically handles cases where `authFetch` throws an error due to non-OK responses, non-JSON content, or AI-related issues (e.g., "Failed to get a response from the OpenAI API", "Server responded with non-JSON content: Status: 404").
  * **Sample Data Display**: If no real income records are found (either an empty array from the API or an error during fetch), a hardcoded sample record is displayed with an informative toast message.
  * **Sorting**: Income records are sorted by date (most recent first) and then by creation date.
  * **Delete Functionality**: `handleDeleteIncome` sends a DELETE request to the API. It includes a client-side confirmation and special handling for deleting the sample record (frontend-only deletion).
  * **UI**: Renders a table to display income records with options to edit or delete each entry.

### `src/app/income/add/page.tsx`

This page provides a form for adding new income records.

  * **State Management**: Manages form input fields (source, amount, date, notes) using `useState`.
  * **Form Submission**: `handleAddIncome` function handles the form submission.
  * **Validation**: Performs client-side validation to ensure all required fields (source, amount, date) are filled.
  * **API Interaction**: Sends a POST request to `/api/income` using `authFetch` to create a new income record.
  * **Error Handling**: Utilizes a `try-catch` block to gracefully handle API errors and display toast messages. It's designed to work with `authFetch` throwing errors on non-`ok` or non-JSON responses.
  * **Redirection**: Upon successful addition, redirects the user to the `/income` page.
  * **Loading Indicator**: Shows a loading state during form submission to prevent multiple submissions.

### `src/app/income/edit/[id]/page.tsx` (Implied, not fully provided)

  * This page is expected to handle editing a specific income record based on its ID. It would likely fetch the existing record data, pre-populate a form, and send a PUT request to update the record.

## API Endpoints

The income management feature interacts with the following API endpoints (managed by your Next.js API routes, e.g., `src/pages/api/income.ts` and `src/pages/api/income/[id].ts`):

  * **`GET /api/income`**: Fetches all income records for the authenticated user.
  * **`POST /api/income`**: Creates a new income record.
  * **`PUT /api/income/:id`**: Updates an existing income record by ID.
  * **`DELETE /api/income/:id`**: Deletes an income record by ID.

**Note on API Responses**: The client-side code (`authFetch` in `AuthContext`) expects JSON responses for both success and error scenarios. Non-JSON responses (e.g., HTML for 404s) will result in client-side errors. Ensure your API routes consistently return JSON.

## Error Handling

The application implements robust error handling for API interactions:

  * **`AuthContext` (`authFetch` utility)**: This custom fetch wrapper automatically attaches the authentication token to requests. Crucially, it parses API responses and throws an `Error` if the response is not `ok` (e.g., a 4xx or 5xx status code) or if the `Content-Type` header is not `application/json`. This centralized error throwing simplifies error handling in components.
  * **Component-Level `try-catch`**: Components like `IncomePage` and `AddIncomePage` use `try-catch` blocks around `authFetch` calls to gracefully handle errors thrown by `authFetch`.
  * **Toast Notifications**: `react-hot-toast` is used to display user-friendly error messages and success notifications.
  * **Specific Error Messages**: Custom error messages are provided for common issues like missing authentication tokens, network errors, and unexpected API response formats.

**Known Issues/Considerations (from console errors):**

  * **`Error: Server responded with non-JSON content. Status: 404.`**: This frequently occurs, indicating that your API endpoints (e.g., `/api/income`) are returning HTML (likely a Next.js 404 page) instead of JSON when an error occurs or a resource is not found. This needs to be addressed in your backend API route implementations to ensure they always return appropriate JSON error objects.
  * **AI API Errors (`OpenAI API`, `Gemini AI`)**: Errors like "Failed to get a response from the OpenAI API" or "Failed to get a response from the Gemini AI" suggest that your `authFetch` or underlying API routes might be unintentionally trying to interact with AI services, or that these integrations are misconfigured/failing. Verify that `/api/income` specifically handles income data and does not involve AI calls unless explicitly intended and correctly implemented.

## Getting Started

To run this part of the DairyFarm App:

1.  **Ensure Authentication Setup**: The `AuthContext` (in `src/context/AuthContext.tsx`) must be correctly configured for user login and token management.
2.  **API Routes**: Set up your Next.js API routes (e.g., `src/pages/api/income.ts`, `src/pages/api/income/[id].ts`) to handle `GET`, `POST`, `PUT`, and `DELETE` requests for income records. These routes should interact with your database (e.g., MongoDB, as suggested by `image_ee4608.png`) and return JSON responses.
3.  **Install Dependencies**: Ensure all project dependencies, including `react-hot-toast`, are installed (`npm install` or `yarn install`).
4.  **Run Development Server**: Start your Next.js application in development mode (`npm run dev` or `yarn dev`).
5.  **Access Page**: Navigate to `/income` in your browser. You will likely be redirected to the login page if not already authenticated.

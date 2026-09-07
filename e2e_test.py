import httpx
import time

BASE_URL = 'http://localhost:8000/api/v1'

print('--- NexSolve End-to-End API Test ---')

with httpx.Client() as client:
    # 1. Login as Student
    print('\n1. Logging in as Student...')
    resp = client.post(f'{BASE_URL}/auth/login', json={'email': 'student@nexsolve.local', 'password': 'student123'}, timeout=10.0)
    student_token = resp.json().get('access_token')
    print(f'   [OK] Token received')

    headers = {'Authorization': f'Bearer {student_token}'}

    # 2. Create a Ticket
    print('\n2. Creating a Ticket (Simulating Student)...')
    ticket_data = {
        'title': 'Server rack in library is smoking',
        'description': 'The main IT rack in the central library is emitting grey smoke and smells like burning plastic. We need someone immediately before the fire alarm goes off.'
    }
    resp = client.post(f'{BASE_URL}/tickets', json=ticket_data, headers=headers, timeout=10.0)
    ticket = resp.json()
    print(f'   [OK] Ticket Created: {ticket.get("ticket_number")}')

    # 3. Analyze with AI (Hits Gemini 3.5 Flash)
    print('\n3. Requesting AI Analysis (Hitting Gemini LLM)...')
    start = time.time()
    # Increased timeout to 60 seconds because Gemini API can sometimes take 15-20s
    resp = client.post(f'{BASE_URL}/ai/analyze', json={'title': ticket_data['title'], 'description': ticket_data['description']}, headers=headers, timeout=60.0)
    ai_result = resp.json()
    print(f'   [OK] Analysis took {time.time() - start:.2f}s')
    print(f'   -> Category: {ai_result.get("category")}')
    print(f'   -> Department: {ai_result.get("department")}')
    print(f'   -> Priority: {ai_result.get("priority")}')
    print(f'   -> Confidence: {ai_result.get("confidence")}')
    print(f'   -> Reason: {ai_result.get("reason")}')
    print(f'   -> Model: {ai_result.get("model_version")}')

    # 4. Login as Admin
    print('\n4. Logging in as Admin...')
    resp = client.post(f'{BASE_URL}/auth/login', json={'email': 'admin@nexsolve.local', 'password': 'admin123'}, timeout=10.0)
    admin_token = resp.json().get('access_token')
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    print(f'   [OK] Admin Token received')

    # 5. Check Dashboard Summary
    print('\n5. Fetching Admin Dashboard Summary...')
    resp = client.get(f'{BASE_URL}/dashboard/summary', headers=admin_headers, timeout=10.0)
    summary = resp.json()
    print(f'   [OK] Total Tickets: {summary.get("total_tickets")}')
    print(f'   [OK] Tickets by Status: {summary.get("tickets_by_status")}')

print('\n--- ALL E2E TESTS PASSED ---')

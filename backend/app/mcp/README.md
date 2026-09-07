# MCP + Intelligent Routing Module

## Overview
This module implements the AI/MCP routing layer for the Smart Student Ticket Auto-Assignment System. It exposes controlled operations to the LLM via the Model Context Protocol (MCP) and handles intelligent capacity-aware ticket assignment.

## Components

### 1. Routing Service (`backend/app/routing/service.py`)
Responsible for the core ticket routing logic. It handles:
- **Staff Capacity Calculation**: Dynamically derives active workload from assignments to ensure accuracy, rather than relying on unreliable static counters.
- **Intelligent Ticket Routing**: Uses deterministic ordering (least active tickets, fewest high-priority tickets, then staff ID) to select the best available staff member in the target department.
- **Transaction-Safe Assignment**: Employs atomic database transactions and `WITH FOR UPDATE` locks to ensure concurrent ticket assignments do not overcommit a staff member's capacity.
- **Manual Triage Integration**: Routes to "MANUAL_TRIAGE" when no available staff has capacity or when a ticket is missing required fields like department.
- **Reassignment Logic**: Preserves historical assignments while properly registering the ticket under a new staff member.

### 2. MCP Server (`backend/app/mcp/server.py`)
Provides thin, secure adapters for the LLM to access backend features safely. The MCP tools included are:
- `search_knowledge_base`: Queries resolved tickets to simulate historical resolution lookup.
- `get_staff_capacity`: Calls the routing service to fetch accurate capacity data.
- `route_ticket`: Automatically routes a given ticket to the best suited agent.
- `assign_ticket`: Manually assigns a ticket using valid constraints.
- `reassign_ticket`: Reassigns a ticket safely, keeping history intact.

The MCP server never exposes arbitrary SQL, database credentials, or internal stack traces. It only wraps application services and translates their outputs into structured responses.

### 3. Tests (`backend/tests/`)
Contains test suites to verify routing logic constraints, capacity constraints, concurrency, and manual triage paths.

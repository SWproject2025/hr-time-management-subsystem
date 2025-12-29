import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/* =========================================================
   Types
========================================================= */

export type OnboardingTaskStatus = "pending" | "in_progress" | "completed";

export interface OnboardingTask {
  _id: string;
  name: string;
  department: string;
  status: OnboardingTaskStatus;
  deadline?: string;
  completedAt?: string;
  completedDocument?: string;
  notes?: string;
}

export interface Onboarding {
  _id: string;
  employeeId: string;
  tasks: OnboardingTask[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingProgress {
  totalTasks: number;
  completedTasks: number;
  progress: number; // 0-100
  onboarding: Onboarding;
}

export interface CreateOnboardingTaskInput {
  name: string;
  department: string;
  deadline?: string;
  notes?: string;
}

export interface CreateOnboardingInput {
  employeeId: string;
  useDefaultTasks?: boolean;
  tasks?: CreateOnboardingTaskInput[];
}

export interface UpdateOnboardingInput {
  completed?: boolean;
}

export interface UpdateOnboardingTaskInput {
  name?: string;
  department?: string;
  status?: OnboardingTaskStatus;
  deadline?: string;
  notes?: string;
  completedDocument?: string;
}

export interface OnboardingQueryParams {
  employeeId?: string;
  completed?: boolean;
  status?: OnboardingTaskStatus;
  search?: string;
}

/* =========================================================
   Axios Client (matches your backend route: /recruitment/onboarding)
========================================================= */

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function createClient(): AxiosInstance {
  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:3000";

  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

const api = createClient();
const BASE = "/recruitment/onboarding";

/* =========================================================
   Onboarding CRUD
========================================================= */

export async function listOnboardings(
  params?: OnboardingQueryParams
): Promise<Onboarding[]> {
  const res = await api.get<Onboarding[]>(BASE, { params });
  return res.data;
}

export async function getOnboardingById(id: string): Promise<Onboarding> {
  const res = await api.get<Onboarding>(`${BASE}/${id}`);
  return res.data;
}

export async function createOnboarding(
  payload: CreateOnboardingInput
): Promise<Onboarding> {
  const res = await api.post<Onboarding>(BASE, payload);
  return res.data;
}

export async function updateOnboarding(
  id: string,
  payload: UpdateOnboardingInput
): Promise<Onboarding> {
  const res = await api.patch<Onboarding>(`${BASE}/${id}`, payload);
  return res.data;
}

export async function deleteOnboarding(
  id: string
): Promise<{ success: boolean } | any> {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
}

/* =========================================================
   Task management
   Assumed routes:
   - POST   /recruitment/onboarding/:id/tasks
   - PATCH  /recruitment/onboarding/:id/tasks/:taskId
   - POST   /recruitment/onboarding/:id/tasks/:taskId/complete
========================================================= */

export async function addOnboardingTask(
  onboardingId: string,
  payload: CreateOnboardingTaskInput
): Promise<Onboarding> {
  const res = await api.post<Onboarding>(`${BASE}/${onboardingId}/tasks`, payload);
  return res.data;
}

export async function updateOnboardingTask(
  onboardingId: string,
  taskId: string,
  payload: UpdateOnboardingTaskInput
): Promise<Onboarding> {
  const res = await api.patch<Onboarding>(
    `${BASE}/${onboardingId}/tasks/${taskId}`,
    payload
  );
  return res.data;
}

export async function completeOnboardingTask(
  onboardingId: string,
  taskId: string,
  payload?: { notes?: string; completedDocument?: string }
): Promise<Onboarding> {
  const res = await api.post<Onboarding>(
    `${BASE}/${onboardingId}/tasks/${taskId}/complete`,
    payload ?? {}
  );
  return res.data;
}

/* =========================================================
   Progress tracking
   - GET /recruitment/onboarding/:id/progress
========================================================= */

export async function getOnboardingProgress(
  onboardingId: string
): Promise<OnboardingProgress> {
  const res = await api.get<OnboardingProgress>(`${BASE}/${onboardingId}/progress`);
  return res.data;
}

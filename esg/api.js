// HALO ESG — API client
// Thin wrapper around fetch() that talks to the Django backend.
// Centralises the base URL, auth header, JSON parsing, and errors so
// component files stay simple.

(function () {
  // ── Config ───────────────────────────────────────────────────
  // Override window.HALO_API_BASE before this file loads to point at
  // a deployed backend. Default = local Django dev server.
  const API_BASE = window.HALO_API_BASE || "http://localhost:8000";

  // Dev-mode auth header (read by DevAuthMiddleware on the backend).
  // Pulled from login.jsx; defaults to ESG Team for testing.
  const DEFAULT_DEV_AUTH = "user=293;roles=ESG Team";

  function devAuthHeader() {
    return window.HALO_DEV_AUTH || DEFAULT_DEV_AUTH;
  }

  // ── Low-level request ────────────────────────────────────────
  async function request(method, path, body, opts = {}) {
    const url = API_BASE + path;
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    // Only attach dev-auth header to non-founder routes
    if (!opts.skipAuth && !path.startsWith("/esg/invite/")) {
      headers["X-Dev-Auth"] = devAuthHeader();
    }

    const init = { method, headers };
    if (body !== undefined && body !== null) {
      init.body = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(url, init);
    } catch (e) {
      const err = new Error("Network error — is the backend running on " + API_BASE + "?");
      err.cause = e;
      throw err;
    }

    if (res.status === 204) return null;

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }

    if (!res.ok) {
      const err = new Error(
        (data && data.detail) || ("HTTP " + res.status + " " + res.statusText)
      );
      err.status = res.status;
      err.body = data;
      throw err;
    }

    return data;
  }

  // ── ESG team / deal team endpoints ───────────────────────────
  const surveys = {
    list:    ()       => request("GET",  "/esg/surveys/"),
    get:     (id)     => request("GET",  `/esg/surveys/${id}/`),
    create:  (body)   => request("POST", "/esg/surveys/", body),
    answers: (id)     => request("GET",  `/esg/surveys/${id}/answers/`),
  };

  const questions = {
    list: () => request("GET", "/esg/questions/"),
  };

  // ── Founder token endpoints (no Halo auth) ───────────────────
  const invite = {
    get:    (token)               => request("GET",  `/esg/invite/${token}/`),
    answer: (token, qid, value)   => request("PUT",  `/esg/invite/${token}/answers/${qid}/`, { value }),
    submit: (token)               => request("POST", `/esg/invite/${token}/submit/`),
  };

  // ── URL helper for the founder token ─────────────────────────
  function tokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
  }

  // Export
  window.HALO_API = {
    base: API_BASE,
    request,
    surveys,
    questions,
    invite,
    tokenFromUrl,
  };
})();

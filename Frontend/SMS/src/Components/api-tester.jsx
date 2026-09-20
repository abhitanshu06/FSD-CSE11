import React, { useState, useEffect, useRef } from "react";

// Method colors matching standard API clients (Postman inspired)
const METHOD_COLORS = {
    GET: "#4caf50",    // Green
    POST: "#ff9800",   // Orange
    PUT: "#2196f3",    // Blue
    DELETE: "#f44336"  // Red
};

// Initial default requests for the "My APIs" collection
const DEFAULT_SAVED_APIS = [
    {
        id: "sample-1",
        name: "Get All Users",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/users",
        params: [],
        headers: [{ id: "1", key: "Accept", value: "application/json", enabled: true }],
        authType: "none",
        authToken: "",
        body: ""
    },
    {
        id: "sample-2",
        name: "Get Single Post",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/posts/1",
        params: [],
        headers: [{ id: "1", key: "Accept", value: "application/json", enabled: true }],
        authType: "none",
        authToken: "",
        body: ""
    },
    {
        id: "sample-3",
        name: "Create Post",
        method: "POST",
        url: "https://jsonplaceholder.typicode.com/posts",
        params: [],
        headers: [{ id: "1", key: "Content-Type", value: "application/json", enabled: true }],
        authType: "none",
        authToken: "",
        body: JSON.stringify({ title: "My Post", body: "Hello World", userId: 1 }, null, 2)
    },
    {
        id: "sample-4",
        name: "Update Post (PUT)",
        method: "PUT",
        url: "https://jsonplaceholder.typicode.com/posts/1",
        params: [],
        headers: [{ id: "1", key: "Content-Type", value: "application/json", enabled: true }],
        authType: "none",
        authToken: "",
        body: JSON.stringify({ id: 1, title: "Updated Title", body: "Updated Body", userId: 1 }, null, 2)
    },
    {
        id: "sample-5",
        name: "Delete Post",
        method: "DELETE",
        url: "https://jsonplaceholder.typicode.com/posts/1",
        params: [],
        headers: [],
        authType: "none",
        authToken: "",
        body: ""
    }
];

const Postman = () => {
    // ----------------------------------------------------
    // REQUEST STATE
    // ----------------------------------------------------
    const [method, setMethod] = useState("GET");
    const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
    const [requestName, setRequestName] = useState("Untitled Request");

    // Navigation & Active Tabs
    const [activeReqTab, setActiveReqTab] = useState("Params"); // Params, Authorization, Headers, Body
    const [activeResTab, setActiveResTab] = useState("Pretty"); // Pretty, Raw, Headers

    // Query Parameters
    const [params, setParams] = useState([
        { id: "1", key: "", value: "", enabled: true }
    ]);

    // Headers
    const [headers, setHeaders] = useState([
        { id: "1", key: "Content-Type", value: "application/json", enabled: true }
    ]);

    // Authorization (None or Bearer Token)
    const [authType, setAuthType] = useState("none"); // none, bearer
    const [authToken, setAuthToken] = useState("");

    // Request Body (JSON)
    const [body, setBody] = useState(`{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}`);

    // ----------------------------------------------------
    // RESPONSE STATE
    // ----------------------------------------------------
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState("");
    const [responseHeaders, setResponseHeaders] = useState({});
    const [status, setStatus] = useState("");
    const [statusCode, setStatusCode] = useState(null);
    const [responseTime, setResponseTime] = useState(null);
    const [copied, setCopied] = useState(false);

    // ----------------------------------------------------
    // LOCALSTORAGE: SAVED APIS & HISTORY
    // ----------------------------------------------------
    const [savedApis, setSavedApis] = useState(() => {
        try {
            const stored = localStorage.getItem("postman_my_apis");
            return stored ? JSON.parse(stored) : DEFAULT_SAVED_APIS;
        } catch {
            return DEFAULT_SAVED_APIS;
        }
    });

    const [history, setHistory] = useState(() => {
        try {
            const stored = localStorage.getItem("postman_history");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("postman_my_apis", JSON.stringify(savedApis));
    }, [savedApis]);

    useEffect(() => {
        localStorage.setItem("postman_history", JSON.stringify(history));
    }, [history]);

    // ----------------------------------------------------
    // TWO-WAY URL & PARAMS SYNCHRONIZATION
    // ----------------------------------------------------
    const isSyncingParamsRef = useRef(false);

    const handleUrlChange = (newUrl) => {
        setUrl(newUrl);
        if (isSyncingParamsRef.current) return;

        try {
            const qIndex = newUrl.indexOf("?");
            if (qIndex !== -1) {
                const queryStr = newUrl.slice(qIndex + 1);
                const searchParams = new URLSearchParams(queryStr);
                const newParams = [];
                let count = 1;
                searchParams.forEach((value, key) => {
                    newParams.push({ id: String(count++), key, value, enabled: true });
                });
                newParams.push({ id: String(count), key: "", value: "", enabled: true });
                setParams(newParams);
            }
        } catch {
            // Ignore URL parsing errors while typing
        }
    };

    const updateParamsAndUrl = (updatedParams) => {
        setParams(updatedParams);
        isSyncingParamsRef.current = true;

        try {
            const baseUrl = url.split("?")[0];
            const activeParams = updatedParams.filter((p) => p.enabled && p.key.trim());

            if (activeParams.length > 0) {
                const searchParams = new URLSearchParams();
                activeParams.forEach((p) => searchParams.append(p.key.trim(), p.value));
                setUrl(`${baseUrl}?${searchParams.toString()}`);
            } else {
                setUrl(baseUrl);
            }
        } catch {
            // Ignore
        } finally {
            setTimeout(() => {
                isSyncingParamsRef.current = false;
            }, 50);
        }
    };

    const handleParamChange = (id, field, value) => {
        const next = params.map((p) => (p.id === id ? { ...p, [field]: value } : p));
        if (id === params[params.length - 1].id && (field === "key" || field === "value") && value.trim()) {
            next.push({ id: String(Date.now()), key: "", value: "", enabled: true });
        }
        updateParamsAndUrl(next);
    };

    const deleteParam = (id) => {
        if (params.length === 1) {
            updateParamsAndUrl([{ id: "1", key: "", value: "", enabled: true }]);
            return;
        }
        updateParamsAndUrl(params.filter((p) => p.id !== id));
    };

    // ----------------------------------------------------
    // HEADERS MANAGEMENT
    // ----------------------------------------------------
    const handleHeaderChange = (id, field, value) => {
        const next = headers.map((h) => (h.id === id ? { ...h, [field]: value } : h));
        if (id === headers[headers.length - 1].id && (field === "key" || field === "value") && value.trim()) {
            next.push({ id: String(Date.now()), key: "", value: "", enabled: true });
        }
        setHeaders(next);
    };

    const deleteHeader = (id) => {
        if (headers.length === 1) {
            setHeaders([{ id: "1", key: "", value: "", enabled: true }]);
            return;
        }
        setHeaders(headers.filter((h) => h.id !== id));
    };

    // ----------------------------------------------------
    // PRETTIFY & VALIDATE JSON
    // ----------------------------------------------------
    const formatBodyJson = () => {
        if (!body.trim()) return;
        try {
            const parsed = JSON.parse(body);
            setBody(JSON.stringify(parsed, null, 2));
        } catch (err) {
            alert("Invalid JSON: " + err.message);
        }
    };

    // ----------------------------------------------------
    // SEND REQUEST (fetch)
    // ----------------------------------------------------
    const sendRequest = async () => {
        if (!url.trim()) {
            alert("Please enter a valid request URL");
            return;
        }

        const methodsWithBody = ["POST", "PUT"];
        if (methodsWithBody.includes(method) && body.trim()) {
            try {
                JSON.parse(body);
            } catch (err) {
                const proceed = window.confirm(
                    `Notice: Your JSON body has a syntax issue:\n${err.message}\n\nDo you want to send it anyway?`
                );
                if (!proceed) return;
            }
        }

        setLoading(true);
        setResponse("");
        setStatus("");
        setStatusCode(null);
        setResponseTime(null);
        setResponseHeaders({});

        const startTime = performance.now();

        try {
            let finalUrl = url.trim();
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = "http://" + finalUrl;
            }

            // Headers construction
            const requestHeaders = new Headers();
            headers.forEach((h) => {
                if (h.enabled && h.key.trim()) {
                    requestHeaders.append(h.key.trim(), h.value);
                }
            });

            // Bearer Auth
            if (authType === "bearer" && authToken.trim()) {
                requestHeaders.set("Authorization", `Bearer ${authToken.trim()}`);
            }

            const options = {
                method: method,
                headers: requestHeaders
            };

            if (methodsWithBody.includes(method) && body.trim()) {
                options.body = body;
                if (!requestHeaders.has("Content-Type")) {
                    requestHeaders.set("Content-Type", "application/json");
                }
            }

            const res = await fetch(finalUrl, options);
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            setResponseTime(duration);
            setStatusCode(res.status);
            setStatus(`${res.status} ${res.statusText || (res.status === 200 ? "OK" : "")}`);

            const headerMap = {};
            res.headers.forEach((val, key) => {
                headerMap[key] = val;
            });
            setResponseHeaders(headerMap);

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                setResponse(JSON.stringify(data, null, 2));
            } else {
                const text = await res.text();
                setResponse(text || "// (Empty response body)");
            }

            // History Logging
            const historyEntry = {
                id: "hist-" + Date.now(),
                name: requestName || finalUrl,
                method: method,
                url: finalUrl,
                status: res.status,
                time: duration,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                savedConfig: {
                    method,
                    url: finalUrl,
                    headers,
                    params,
                    authType,
                    authToken,
                    body
                }
            };

            setHistory((prev) => [historyEntry, ...prev.slice(0, 49)]);
        } catch (error) {
            const endTime = performance.now();
            setResponseTime(Math.round(endTime - startTime));
            setStatusCode(0);
            setStatus("Error: Request Failed");
            setResponse(
                `Error: ${error.message}\n\nTroubleshooting tips:\n1. If this is a local server (e.g. http://localhost:3000), make sure it is running.\n2. Ensure CORS is enabled on the server (app.use(cors()) in Express).\n3. Check URL correctness.`
            );
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // RESTORE REQUEST (FROM MY APIS OR HISTORY)
    // ----------------------------------------------------
    const restoreRequest = (item) => {
        const config = item.savedConfig || item;
        setMethod(config.method || "GET");
        setUrl(config.url || "");
        setRequestName(item.name || config.name || "Untitled Request");
        if (config.headers) setHeaders(config.headers.length ? config.headers : [{ id: "1", key: "", value: "", enabled: true }]);
        if (config.params) setParams(config.params.length ? config.params : [{ id: "1", key: "", value: "", enabled: true }]);
        if (config.authType) setAuthType(config.authType);
        if (config.authToken !== undefined) setAuthToken(config.authToken);
        if (config.body !== undefined) setBody(config.body);
    };

    // ----------------------------------------------------
    // NAVBAR BUTTON HANDLERS
    // ----------------------------------------------------
    const handleNewRequest = () => {
        setMethod("GET");
        setUrl("");
        setRequestName("New Request");
        setParams([{ id: "1", key: "", value: "", enabled: true }]);
        setHeaders([{ id: "1", key: "Content-Type", value: "application/json", enabled: true }]);
        setAuthType("none");
        setAuthToken("");
        setBody("");
        setResponse("");
        setStatus("");
        setStatusCode(null);
        setResponseTime(null);
    };

    const handleSaveRequest = () => {
        const name = window.prompt("Enter a name for this request:", requestName || "My Request");
        if (!name) return;

        const newSaved = {
            id: "saved-" + Date.now(),
            name: name.trim(),
            method,
            url,
            params,
            headers,
            authType,
            authToken,
            body
        };

        setSavedApis((prev) => [newSaved, ...prev]);
        setRequestName(name.trim());
        alert(`Saved "${name.trim()}" to My APIs!`);
    };

    const handleDeleteSaved = (id, e) => {
        e.stopPropagation();
        if (window.confirm("Remove this request from My APIs?")) {
            setSavedApis((prev) => prev.filter((item) => item.id !== id));
        }
    };

    const handleClearHistory = () => {
        if (window.confirm("Clear all request history?")) {
            setHistory([]);
        }
    };

    const handleCopyResponse = () => {
        if (!response) return;
        navigator.clipboard.writeText(response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={uiStyles.appContainer}>
            {/* SCOPED CSS FOR HOVERS AND INTERACTIONS */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

        .pm-nav-btn:hover {
          background-color: #3e4046 !important;
          color: #ffffff !important;
        }
        .pm-item-row:hover {
          background-color: #f1f3f5 !important;
        }
        .pm-del-btn {
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .pm-item-row:hover .pm-del-btn {
          opacity: 1;
        }
        .pm-del-btn:hover {
          color: #f44336 !important;
        }
        .pm-send-btn:hover:not(:disabled) {
          background-color: #e85c26 !important;
        }
        .pm-send-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .pm-tab-btn:hover {
          color: #ff6c37 !important;
        }
      `}</style>

            {/* 1. TOP NAVBAR */}
            <header style={uiStyles.navbar}>
                <span style={uiStyles.logoTitle}>API Tester</span>
            </header>

            {/* MAIN LAYOUT */}
            <div style={uiStyles.mainLayout}>
            {/* MAIN WORKSPACE */}
            <main style={uiStyles.mainContent}>
                    {/* Request Header */}
                    <div style={uiStyles.requestHeader}>
                        <input
                            type="text"
                            value={requestName}
                            onChange={(e) => setRequestName(e.target.value)}
                            placeholder="Name your request..."
                            style={uiStyles.requestNameInput}
                        />
                    </div>

                    {/* REQUEST BAR: METHOD + URL + SEND BUTTON */}
                    <div style={uiStyles.requestBar}>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            style={{
                                ...uiStyles.methodSelect,
                                color: METHOD_COLORS[method] || "#4caf50"
                            }}
                        >
                            <option value="GET" style={{ color: METHOD_COLORS.GET }}>GET</option>
                            <option value="POST" style={{ color: METHOD_COLORS.POST }}>POST</option>
                            <option value="PUT" style={{ color: METHOD_COLORS.PUT }}>PUT</option>
                            <option value="DELETE" style={{ color: METHOD_COLORS.DELETE }}>DELETE</option>
                        </select>

                        <input
                            type="text"
                            value={url}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            placeholder="Enter request URL (e.g. https://jsonplaceholder.typicode.com/posts/1)"
                            style={uiStyles.urlInput}
                        />

                        <button
                            onClick={sendRequest}
                            disabled={loading}
                            style={uiStyles.sendButton}
                            className="pm-send-btn"
                        >
                            {loading ? "Sending..." : "Send"}
                        </button>
                    </div>

                    {/* REQUEST TABS */}
                    <div style={uiStyles.tabsBar}>
                        {["Params", "Authorization", "Headers", "Body"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveReqTab(tab)}
                                className="pm-tab-btn"
                                style={{
                                    ...uiStyles.tabButton,
                                    borderBottom: activeReqTab === tab ? "2px solid #ff6c37" : "2px solid transparent",
                                    color: activeReqTab === tab ? "#ff6c37" : "#555"
                                }}
                            >
                                {tab}
                                {tab === "Params" && params.filter((p) => p.enabled && p.key.trim()).length > 0 && (
                                    <span style={uiStyles.countBadge}>
                                        {params.filter((p) => p.enabled && p.key.trim()).length}
                                    </span>
                                )}
                                {tab === "Headers" && headers.filter((h) => h.enabled && h.key.trim()).length > 0 && (
                                    <span style={uiStyles.countBadge}>
                                        {headers.filter((h) => h.enabled && h.key.trim()).length}
                                    </span>
                                )}
                                {tab === "Authorization" && authType !== "none" && (
                                    <span style={uiStyles.countBadge}>✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* TAB PANELS */}
                    <div style={uiStyles.tabContentArea}>
                        {/* PARAMS */}
                        {activeReqTab === "Params" && (
                            <div>
                                <div style={uiStyles.subtext}>
                                    Query parameters automatically update and append to the URL.
                                </div>
                                <table style={uiStyles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "36px" }}></th>
                                            <th style={{ width: "45%" }}>Key</th>
                                            <th style={{ width: "45%" }}>Value</th>
                                            <th style={{ width: "36px" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {params.map((row) => (
                                            <tr key={row.id}>
                                                <td style={{ textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={row.enabled}
                                                        onChange={(e) => handleParamChange(row.id, "enabled", e.target.checked)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        placeholder="Parameter Name"
                                                        value={row.key}
                                                        onChange={(e) => handleParamChange(row.id, "key", e.target.value)}
                                                        style={uiStyles.tableInput}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        placeholder="Value"
                                                        value={row.value}
                                                        onChange={(e) => handleParamChange(row.id, "value", e.target.value)}
                                                        style={uiStyles.tableInput}
                                                    />
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        style={uiStyles.deleteRowBtn}
                                                        onClick={() => deleteParam(row.id)}
                                                        title="Delete parameter"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button
                                    style={uiStyles.addBtn}
                                    onClick={() =>
                                        setParams([...params, { id: String(Date.now()), key: "", value: "", enabled: true }])
                                    }
                                >
                                    + Add Parameter
                                </button>
                            </div>
                        )}

                        {/* AUTHORIZATION */}
                        {activeReqTab === "Authorization" && (
                            <div style={uiStyles.authContainer}>
                                <div style={{ width: "180px" }}>
                                    <label style={uiStyles.fieldLabel}>Type</label>
                                    <select
                                        value={authType}
                                        onChange={(e) => setAuthType(e.target.value)}
                                        style={uiStyles.selectInput}
                                    >
                                        <option value="none">No Auth</option>
                                        <option value="bearer">Bearer Token</option>
                                    </select>
                                </div>

                                <div style={{ flex: 1 }}>
                                    {authType === "none" && (
                                        <div style={{ color: "#777", paddingTop: "20px" }}>
                                            This request will be sent without any authorization headers.
                                        </div>
                                    )}

                                    {authType === "bearer" && (
                                        <div>
                                            <label style={uiStyles.fieldLabel}>Token</label>
                                            <textarea
                                                value={authToken}
                                                onChange={(e) => setAuthToken(e.target.value)}
                                                placeholder="Paste Bearer / JWT token here..."
                                                style={uiStyles.bearerTextarea}
                                            />
                                            <div style={uiStyles.subtext}>
                                                Token is sent in the <code>Authorization: Bearer &lt;token&gt;</code> header.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* HEADERS */}
                        {activeReqTab === "Headers" && (
                            <div>
                                <div style={uiStyles.subtext}>HTTP headers sent with your request.</div>
                                <table style={uiStyles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "36px" }}></th>
                                            <th style={{ width: "45%" }}>Key</th>
                                            <th style={{ width: "45%" }}>Value</th>
                                            <th style={{ width: "36px" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {headers.map((row) => (
                                            <tr key={row.id}>
                                                <td style={{ textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={row.enabled}
                                                        onChange={(e) => handleHeaderChange(row.id, "enabled", e.target.checked)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        placeholder="Header Key (e.g. Content-Type)"
                                                        value={row.key}
                                                        onChange={(e) => handleHeaderChange(row.id, "key", e.target.value)}
                                                        style={uiStyles.tableInput}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        placeholder="Value (e.g. application/json)"
                                                        value={row.value}
                                                        onChange={(e) => handleHeaderChange(row.id, "value", e.target.value)}
                                                        style={uiStyles.tableInput}
                                                    />
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button
                                                        style={uiStyles.deleteRowBtn}
                                                        onClick={() => deleteHeader(row.id)}
                                                        title="Delete header"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button
                                    style={uiStyles.addBtn}
                                    onClick={() =>
                                        setHeaders([...headers, { id: String(Date.now()), key: "", value: "", enabled: true }])
                                    }
                                >
                                    + Add Header
                                </button>
                            </div>
                        )}

                        {/* BODY */}
                        {activeReqTab === "Body" && (
                            <div>
                                {method === "GET" || method === "DELETE" ? (
                                    <div style={uiStyles.bodyNotice}>
                                        ℹ️ <strong>{method}</strong> requests do not require a request body.
                                        Select <strong>POST</strong> or <strong>PUT</strong> to submit a JSON body payload.
                                    </div>
                                ) : (
                                    <>
                                        <div style={uiStyles.bodyToolbar}>
                                            <span style={{ fontWeight: "bold", fontSize: "13px" }}>Raw JSON Body</span>
                                            <button style={uiStyles.formatBtn} onClick={formatBodyJson}>
                                                ✨ Prettify JSON
                                            </button>
                                        </div>

                                        <textarea
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            placeholder={`{\n  "key": "value"\n}`}
                                            style={uiStyles.bodyTextarea}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 5. RESPONSE SECTION */}
                    <div style={uiStyles.responseSection}>
                        <div style={uiStyles.responseHeader}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={uiStyles.responseTitle}>Response</span>

                                {status && (
                                    <span
                                        style={{
                                            ...uiStyles.statusBadge,
                                            backgroundColor:
                                                statusCode >= 200 && statusCode < 300
                                                    ? "rgba(76, 175, 80, 0.15)"
                                                    : "rgba(244, 67, 54, 0.15)",
                                            color: statusCode >= 200 && statusCode < 300 ? "#2e7d32" : "#c62828"
                                        }}
                                    >
                                        Status: {status}
                                    </span>
                                )}

                                {responseTime !== null && (
                                    <span style={uiStyles.metaMetric}>⏱ {responseTime} ms</span>
                                )}
                            </div>

                            {response && (
                                <button style={uiStyles.copyBtn} onClick={handleCopyResponse}>
                                    {copied ? "✓ Copied!" : "📋 Copy"}
                                </button>
                            )}
                        </div>

                        {/* Response Toolbar */}
                        <div style={uiStyles.responseToolbar}>
                            <button
                                style={{
                                    ...uiStyles.resTabBtn,
                                    color: activeResTab === "Pretty" ? "#ff6c37" : "#666",
                                    fontWeight: activeResTab === "Pretty" ? "bold" : "normal"
                                }}
                                onClick={() => setActiveResTab("Pretty")}
                            >
                                Pretty
                            </button>
                            <button
                                style={{
                                    ...uiStyles.resTabBtn,
                                    color: activeResTab === "Raw" ? "#ff6c37" : "#666",
                                    fontWeight: activeResTab === "Raw" ? "bold" : "normal"
                                }}
                                onClick={() => setActiveResTab("Raw")}
                            >
                                Raw
                            </button>
                            <button
                                style={{
                                    ...uiStyles.resTabBtn,
                                    color: activeResTab === "Headers" ? "#ff6c37" : "#666",
                                    fontWeight: activeResTab === "Headers" ? "bold" : "normal"
                                }}
                                onClick={() => setActiveResTab("Headers")}
                            >
                                Headers ({Object.keys(responseHeaders).length})
                            </button>
                        </div>

                        {/* Response Box */}
                        {activeResTab === "Headers" ? (
                            <div style={uiStyles.responseHeadersTable}>
                                {Object.keys(responseHeaders).length === 0 ? (
                                    <div style={{ color: "#888" }}>No response headers received yet.</div>
                                ) : (
                                    <table style={uiStyles.table}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: "35%" }}>Header Key</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(responseHeaders).map(([key, val]) => (
                                                <tr key={key}>
                                                    <td style={{ fontWeight: "bold" }}>{key}</td>
                                                    <td style={{ fontFamily: "Consolas, monospace" }}>{val}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ) : (
                            <pre style={uiStyles.responseBox}>
                                {response || (loading ? "// Sending HTTP request..." : "// Send a request to see the response here")}
                            </pre>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

// ========================================================
// UI STYLES
// ========================================================
const uiStyles = {
    appContainer: {
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#222",
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        boxSizing: "border-box"
    },
    navbar: {
        height: "64px",
        backgroundColor: "#ffffff",
        color: "#1e2229",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
    },
    logoTitle: {
        fontFamily: "'Dancing Script', 'Brush Script MT', 'Lucida Calligraphy', 'Segoe Script', cursive",
        fontSize: "34px",
        fontWeight: "700",
        letterSpacing: "1px",
        color: "#202124",
        textAlign: "center"
    },
    badge: {
        fontSize: "11px",
        backgroundColor: "rgba(255, 108, 55, 0.2)",
        color: "#ff6c37",
        padding: "3px 8px",
        borderRadius: "12px",
        fontWeight: "normal"
    },
    navRight: {
        display: "flex",
        gap: "8px"
    },
    navButton: {
        backgroundColor: "#303134",
        color: "#e8eaed",
        border: "1px solid #44464d",
        borderRadius: "5px",
        padding: "6px 14px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "bold",
        transition: "all 0.15s ease"
    },
    mainLayout: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        maxWidth: "980px",
        margin: "0 auto",
        minHeight: "calc(100vh - 64px)",
        boxSizing: "border-box"
    },
    sidebar: {
        width: "250px",
        minWidth: "220px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column"
    },
    sidebarTabs: {
        display: "flex",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#fafafa"
    },
    sidebarTabBtn: {
        flex: 1,
        padding: "12px 6px",
        fontSize: "12px",
        fontWeight: "bold",
        background: "none",
        border: "none",
        cursor: "pointer"
    },
    sidebarBody: {
        flex: 1,
        padding: "14px 10px",
        overflowY: "auto"
    },
    sidebarSectionTitle: {
        fontWeight: "bold",
        fontSize: "12px",
        color: "#555",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
        padding: "0 6px"
    },
    clearHistoryBtn: {
        background: "none",
        border: "none",
        color: "#ff6c37",
        fontSize: "11px",
        cursor: "pointer",
        padding: "2px 4px"
    },
    itemsList: {
        display: "flex",
        flexDirection: "column",
        gap: "2px"
    },
    requestItemRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 10px",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background 0.12s",
        position: "relative"
    },
    methodBadge: {
        fontSize: "11px",
        fontWeight: "900",
        minWidth: "48px",
        textAlign: "left"
    },
    requestItemName: {
        fontSize: "13px",
        color: "#333",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flex: 1
    },
    deleteSmallBtn: {
        background: "none",
        border: "none",
        color: "#888",
        fontSize: "12px",
        cursor: "pointer",
        padding: "2px 6px"
    },
    emptyNotice: {
        padding: "20px",
        textAlign: "center",
        fontSize: "12px",
        color: "#888"
    },
    mainContent: {
        flex: 1,
        padding: "20px 25px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
    },
    requestHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    requestNameInput: {
        fontSize: "16px",
        fontWeight: "bold",
        color: "#222",
        background: "transparent",
        border: "1px solid transparent",
        borderRadius: "4px",
        padding: "4px 8px",
        outline: "none",
        width: "320px"
    },
    requestBar: {
        display: "flex",
        borderRadius: "6px",
        overflow: "hidden",
        border: "1px solid #ccc",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    },
    methodSelect: {
        width: "115px",
        padding: "12px 14px",
        border: "none",
        borderRight: "1px solid #ccc",
        backgroundColor: "#ffffff",
        color: "#222222",
        fontWeight: "bold",
        fontSize: "14px",
        cursor: "pointer",
        outline: "none"
    },
    urlInput: {
        flex: 1,
        padding: "12px 16px",
        border: "none",
        outline: "none",
        fontSize: "14px",
        fontFamily: "inherit",
        backgroundColor: "#ffffff",
        color: "#222222"
    },
    sendButton: {
        padding: "0 28px",
        backgroundColor: "#ff6c37",
        color: "#ffffff",
        border: "none",
        fontWeight: "bold",
        fontSize: "14px",
        cursor: "pointer",
        transition: "background 0.15s"
    },
    tabsBar: {
        display: "flex",
        gap: "24px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#ffffff",
        padding: "0 16px"
    },
    tabButton: {
        background: "none",
        border: "none",
        padding: "14px 4px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px"
    },
    countBadge: {
        backgroundColor: "#e0e0e0",
        color: "#333",
        fontSize: "10px",
        borderRadius: "10px",
        padding: "1px 6px"
    },
    tabContentArea: {
        backgroundColor: "#ffffff",
        padding: "16px 20px",
        borderRadius: "6px",
        border: "1px solid #e0e0e0",
        minHeight: "180px"
    },
    subtext: {
        fontSize: "12px",
        color: "#666",
        marginBottom: "10px"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "10px"
    },
    tableInput: {
        width: "100%",
        padding: "6px 8px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        boxSizing: "border-box",
        fontSize: "12px"
    },
    deleteRowBtn: {
        background: "none",
        border: "none",
        color: "#999",
        cursor: "pointer",
        fontSize: "14px"
    },
    addBtn: {
        backgroundColor: "transparent",
        border: "1px dashed #bbb",
        padding: "6px 14px",
        fontSize: "12px",
        borderRadius: "4px",
        cursor: "pointer",
        color: "#555"
    },
    authContainer: {
        display: "flex",
        gap: "24px"
    },
    fieldLabel: {
        display: "block",
        fontWeight: "bold",
        fontSize: "12px",
        marginBottom: "6px"
    },
    selectInput: {
        width: "100%",
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "13px"
    },
    bearerTextarea: {
        width: "100%",
        height: "70px",
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontFamily: "monospace",
        fontSize: "12px",
        boxSizing: "border-box"
    },
    bodyToolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
    },
    formatBtn: {
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        padding: "5px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        cursor: "pointer"
    },
    bodyTextarea: {
        width: "100%",
        minHeight: "160px",
        boxSizing: "border-box",
        padding: "14px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: "13px",
        lineHeight: "1.4",
        backgroundColor: "#fafafa",
        resize: "vertical"
    },
    bodyNotice: {
        padding: "24px 16px",
        color: "#555",
        fontSize: "13px",
        backgroundColor: "#f9f9f9",
        borderRadius: "4px",
        textAlign: "center"
    },
    responseSection: {
        backgroundColor: "#ffffff",
        borderRadius: "6px",
        border: "1px solid #e0e0e0",
        overflow: "hidden"
    },
    responseHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 18px",
        borderBottom: "1px solid #eee"
    },
    responseTitle: {
        fontWeight: "bold",
        fontSize: "15px"
    },
    statusBadge: {
        fontSize: "12px",
        fontWeight: "bold",
        padding: "3px 10px",
        borderRadius: "12px"
    },
    metaMetric: {
        fontSize: "12px",
        color: "#666",
        fontWeight: "500"
    },
    copyBtn: {
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        padding: "4px 10px",
        borderRadius: "4px",
        fontSize: "11px",
        cursor: "pointer",
        fontWeight: "bold"
    },
    responseToolbar: {
        display: "flex",
        gap: "16px",
        padding: "8px 18px",
        backgroundColor: "#fafafa",
        borderBottom: "1px solid #eee",
        fontSize: "12px"
    },
    resTabBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 0",
        fontSize: "12px"
    },
    responseBox: {
        margin: 0,
        padding: "18px",
        minHeight: "220px",
        maxHeight: "480px",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        overflow: "auto",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: "13px",
        lineHeight: "1.5",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word"
    },
    responseHeadersTable: {
        padding: "14px 18px",
        maxHeight: "300px",
        overflowY: "auto"
    }
};

export default Postman;

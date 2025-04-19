(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root of the server]__ebf7387e._.js", {

"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[project]/src/middleware.js [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
(()=>{
    const e = new Error("Cannot find module 'js-cookie'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$react$2e$react$2d$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/react.react-server.js [middleware-edge] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'react-router-dom'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
;
const useAuthMiddleware = ()=>{
    const location = useLocation();
    const navigate = useNavigate();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$react$2e$react$2d$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const token = Cookies.get("accessToken");
        const publicPaths = [
            "/login"
        ];
        const pathIsPublic = publicPaths.includes(location.pathname);
        if (!token && !pathIsPublic) {
            navigate("/login");
        }
    }, [
        location,
        navigate
    ]);
    return null;
};
const __TURBOPACK__default__export__ = useAuthMiddleware;
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__ebf7387e._.js.map
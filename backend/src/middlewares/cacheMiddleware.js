import apicache from "apicache"

const cache = apicache.options({
  appendKey: (req, res) => req.user?.id || "guest", // Use user ID for per-user caching (or "guest" if not logged in)
  statusCodes: { // Cache only successful responses (exclude errors)
    include: [200],
    exclude: [401, 403, 404, 500]
  }
}).middleware

export default cache

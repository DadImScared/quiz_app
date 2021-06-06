module.exports = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/quiztower",
        permanent: true,
      },
    ]
  },
}

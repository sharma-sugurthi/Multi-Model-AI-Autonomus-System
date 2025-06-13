module.exports = {
  NextResponse: {
    json: (data, init) => {
      const response = {
        json: () => Promise.resolve(data),
        status: init?.status || 200,
        headers: new Headers(init?.headers || {
          'Content-Type': 'application/json',
        }),
      };
      return response;
    },
  },
}; 
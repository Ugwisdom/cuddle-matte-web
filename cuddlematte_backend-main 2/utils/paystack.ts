import https from 'https';

const paystackRequest = (path: string, method: 'GET' | 'POST', payload?: Record<string, any>) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  const data = payload ? JSON.stringify(payload) : null;

  return new Promise<{ statusCode?: number; body: any }>((resolve, reject) => {
    const req = https.request({
      hostname: 'api.paystack.co',
      path,
      method,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData || '{}');
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (err) {
          reject(new Error('Failed to parse Paystack response'));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }

    req.end();
  });
};

export { paystackRequest };

// api/properties.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Return dummy properties data as JSON
    return res.status(200).json({
      pendingProperties: [
        { id: 1, name: 'Property 1', status: 'pending' },
        { id: 2, name: 'Property 2', status: 'pending' },
      ],
      approvedProperties: [
        { id: 3, name: 'Property 3', status: 'approved' },
      ],
    });
  } else if (req.method === 'POST') {
    // Simulate adding a new approved property
    const { newProperty } = req.body;
    // Here you could save to a database or in-memory storage
    return res.status(200).json({ message: 'Property added', property: newProperty });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

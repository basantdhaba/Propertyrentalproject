"use client"
import ContactForm from "@/components/ContactForm"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="mb-6">
            Have questions about our services? Need help with your account? We're here to help. Fill out the form and
            we'll get back to you as soon as possible.
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Our Office</h3>
            <p className="text-gray-600">123 Property Street</p>
            <p className="text-gray-600">Real Estate City, 12345</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Contact Information</h3>
            <p className="text-gray-600">Email: support@rentease.com</p>
            <p className="text-gray-600">Phone: +1 (555) 123-4567</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Business Hours</h3>
            <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
            <p className="text-gray-600">Sunday: Closed</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}


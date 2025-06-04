import React from 'react'
import { render, screen } from '@testing-library/react'
import Debug from '../debug'

describe('Debug component', () => {
  beforeAll(() => {
    // Set up environment variables for the test
    import.meta.env.VITE_DEV_MODE = 'true'
    import.meta.env.VITE_SKIP_AUTHENTICATION = 'true'
    import.meta.env.VITE_API_URL = 'http://localhost:8000'
    // Simulate stored auth data
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', name: 'Tester' }))
  })

  it('renders debug header and environment info', () => {
    render(<Debug />)
    expect(screen.getByText('K8s Dash Debug Page')).toBeInTheDocument()
    expect(screen.getByText(/VITE_DEV_MODE:/)).toHaveTextContent('VITE_DEV_MODE: true')
    expect(screen.getByText(/VITE_SKIP_AUTHENTICATION:/)).toHaveTextContent('VITE_SKIP_AUTHENTICATION: true')
    expect(screen.getByText(/VITE_API_URL:/)).toHaveTextContent('VITE_API_URL: http://localhost:8000')
    expect(screen.getByText(/token:/)).toHaveTextContent('token: exists')
    expect(screen.getByText(/user:/)).toHaveTextContent('user: exists')
  })
}) 
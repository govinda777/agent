import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Example Unit Test', () => {
  it('renders a simple element', () => {
    render(<div data-testid="test-div">Hello Testing</div>)
    expect(screen.getByTestId('test-div')).toHaveTextContent('Hello Testing')
  })
})

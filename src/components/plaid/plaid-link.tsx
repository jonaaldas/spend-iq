import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link'
import { Button } from '../ui/button'

interface PlaidLinkProps {
  onSuccess: PlaidLinkOnSuccess
  options: PlaidLinkOptions
}

export default function PlaidLink({ onSuccess, options }: PlaidLinkProps) {
  return (
    <>
      <Button onClick={() => open()}>Connect</Button>
    </>
  )
}

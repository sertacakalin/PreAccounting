/**
 * Login Modal Component
 * Dialog with login form (react-hook-form + Zod validation)
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoginForm } from '@/components/auth/LoginForm'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome Back</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your dashboard
          </DialogDescription>
        </DialogHeader>

        <LoginForm onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  )
}

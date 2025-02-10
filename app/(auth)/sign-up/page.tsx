"use client"

import AuthForm from '@/components/form/AuthForm'
import { SignUpSchema } from '@/lib/validations'
import React from 'react'

const SignUp = () => {
  return <AuthForm 
    formType='SIGN_UP'
    schema={SignUpSchema}
    defaultValues={{ email: "", password: "", username: "", name: "" }}
    onSubmit={(data) => Promise.resolve({ success: true, data })}
  />
}

export default SignUp
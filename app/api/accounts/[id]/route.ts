import Account from "@/database/account.model"
import handleError from "@/lib/handlers/error"
import { NotFoundError, ValidationError } from "@/lib/http-errors"
import dbConnect from "@/lib/mongoose"
import { AccountSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

// GET /api/users/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) throw new NotFoundError("Account not found")
  
  try {
    await dbConnect()

    const account = await Account.findById(id)

    if(!account) throw new NotFoundError("Account not found")

    return NextResponse.json({ success: true, data: account }, { status: 200 })

  } catch (error) {
    // eslint-disable-next-line no-undef
    return handleError(error, "api") as APIErrorResponse
  }

}

// DELETE /api/accounts/[id]
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) throw new NotFoundError("Account not found")

  try {
    await dbConnect()

    const account = await Account.findByIdAndDelete(id)

    if(!account) throw new NotFoundError("Account not found")

    return NextResponse.json({ success: true, data: account }, { status: 200 })

  } catch (error) {
    // eslint-disable-next-line no-undef
    return handleError(error, "api") as APIErrorResponse
  }
}

// PUT /api/users/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) throw new NotFoundError("Account not found")

  try {
    await dbConnect()

    const body = await request.json()
    const validatedData = AccountSchema.partial().safeParse(body)

    if(!validatedData.success) throw new ValidationError(validatedData.error.flatten().fieldErrors)

    const updatedAccount = await Account.findByIdAndUpdate(id, validatedData, { new: true })

    if(!updatedAccount) throw new NotFoundError("Account not found")

    return NextResponse.json({ success: true, data: updatedAccount }, { status: 200 })

  } catch (error) {
    // eslint-disable-next-line no-undef
    return handleError(error, "api") as APIErrorResponse
  }
}
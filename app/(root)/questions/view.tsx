"use client"

import { toast } from "@/hooks/use-toast"
import { useEffect } from "react"

const view = ({ questionId }: { questionId: string }) => {
  const handleIncrement = async () => {
    const result = await incrementViews({ questionId })

    if (result.success) {
      toast({
        title: "Success",
        description: "Views incremented",
      })
    }
  }

  useEffect(() => {
    handleIncrement()
  }, [])

  return null
}

export default view
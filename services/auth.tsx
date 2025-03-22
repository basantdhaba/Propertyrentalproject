import { signIn as firebaseSignIn } from "@/lib/firebase"

export const signIn = async (email: string, password: string) => {
  const { user, error } = await firebaseSignIn(email, password)
  return { user, error }
}


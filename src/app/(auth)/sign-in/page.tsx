'use client'
import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button className="bg-red-950 rounded-md px-3 py-2 mt-2 ml-2 font-bold hover:bg-orange-700 hover:text-stone-700" onClick={() => signIn()}>Sign in</button>
    </>
  )
}
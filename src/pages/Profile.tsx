import { UserProfile } from "../components/user-profile"

export function Profile() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">个人资料</h1>
      <UserProfile />
    </div>
  )
} 
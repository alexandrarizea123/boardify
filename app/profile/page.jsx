import ProfileGate from '../../src/components/profile/ProfileGate'

export const metadata = {
  title: 'Boardify · Profile',
}

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  return <ProfileGate />
}

import { DoctorProfilePage } from "@/components/public-profile/doctor-profile-page"

interface DoctorPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params
  return <DoctorProfilePage doctorId={id} />
}

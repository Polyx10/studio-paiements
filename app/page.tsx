import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import StudioLogo from '@/components/StudioLogo'
import { Search, Settings } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <div className="w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-lg py-6">
          <StudioLogo />
        </div>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">STUDIO e - Paiements</CardTitle>
          <CardDescription>Gestion des paiements et cotisations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/consultation">
            <Button className="w-full h-20 text-lg" size="lg">
              <Search className="w-6 h-6 mr-3" />
              Consulter mes paiements
            </Button>
          </Link>
          
          <Link href="/admin">
            <Button variant="outline" className="w-full h-20 text-lg" size="lg">
              <Settings className="w-6 h-6 mr-3" />
              Administration
            </Button>
          </Link>
        </CardContent>
        
        <div className="px-6 pb-6">
          <p className="text-xs text-center text-gray-500">
            Consultation sécurisée des montants dus et historique des paiements
          </p>
        </div>
      </Card>
    </div>
  )
}

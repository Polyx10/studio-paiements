'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/api-client'
import StudioLogo from '@/components/StudioLogo'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function ConsultationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [result, setResult] = useState<{
    found: boolean
    name?: string
    amount?: number
    reason?: string
    isPaid?: boolean
  } | null>(null)

  const handleAccessCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const correctCode = await db.getAccessCode()
    if (accessCode.toUpperCase() === correctCode.toUpperCase()) {
      setIsAuthenticated(true)
    } else {
      alert('Code d\'accès incorrect')
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !birthDate.trim()) {
      alert('Veuillez remplir tous les champs')
      return
    }

    const payment = await db.findPayment(name.trim(), birthDate.trim())
    
    if (payment) {
      setResult({
        found: true,
        name: payment.name,
        amount: payment.amount,
        reason: payment.reason,
        isPaid: payment.is_paid
      })
    } else {
      setResult({
        found: false
      })
    }
  }

  const handleReset = () => {
    setName('')
    setBirthDate('')
    setResult(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <div className="w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-lg py-6">
            <StudioLogo />
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">STUDIO e - Paiements</CardTitle>
            <CardDescription>Consultation des montants dus</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessCode} className="space-y-4">
              <div>
                <Label htmlFor="accessCode">Code d'accès</Label>
                <Input
                  id="accessCode"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Entrez le code d'accès"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Accéder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <div className="w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-lg py-6">
            <StudioLogo />
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Consultation de votre montant</CardTitle>
            <CardDescription>
              Entrez votre nom et votre date de naissance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom et prénom *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Marie Dupont"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">Date de naissance (JJ/MM/AAAA) *</Label>
                  <Input
                    id="birthDate"
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="Ex: 15/03/2010"
                    className="mt-1"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Consulter mon montant
                </Button>
              </form>
            ) : result.found ? (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{result.name}</h3>
                </div>

                {result.isPaid ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <p className="text-green-800 font-semibold text-lg mb-2">
                      ✓ Paiement effectué
                    </p>
                    <p className="text-green-700">
                      Votre paiement a bien été enregistré
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Montant dû :</p>
                    <p className="text-4xl font-bold text-blue-900 mb-4">
                      {result.amount}€
                    </p>
                    {result.reason && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Motif :</p>
                        <p className="text-gray-800">{result.reason}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={handleReset} variant="outline" className="w-full">
                  Nouvelle recherche
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun résultat</h3>
                  <p className="text-gray-600">
                    Aucun montant trouvé pour ces informations.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Vérifiez que le nom et la date de naissance sont corrects.
                  </p>
                </div>

                <Button onClick={handleReset} variant="outline" className="w-full">
                  Nouvelle recherche
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Les informations sont strictement confidentielles.
          </p>
          <p className="mt-1">
            En cas de question, contactez le studio.
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { db } from '@/lib/api-client'
import type { Payment } from '@/lib/types'
import { Upload, Trash2, Download, CheckCircle, Eye, EyeOff, Edit } from 'lucide-react'
import StudioLogo from '@/components/StudioLogo'
import * as XLSX from 'xlsx'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [history, setHistory] = useState<Payment[]>([])
  const [importText, setImportText] = useState('')
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set())
  const [accessCode, setAccessCode] = useState('')
  const [newAccessCode, setNewAccessCode] = useState('')
  const [showAccessCodeForm, setShowAccessCodeForm] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingBirthDate, setEditingBirthDate] = useState('')
  const [editingAmount, setEditingAmount] = useState('')
  const [editingReason, setEditingReason] = useState('')
  const [selectedHistory, setSelectedHistory] = useState<Set<string>>(new Set())
  const [selectedHistoryCount, setSelectedHistoryCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = async () => {
    const [paymentsData, historyData, settings] = await Promise.all([
      db.getPayments(),
      db.getPaymentHistory(),
      db.getAccessCode()
    ])
    setPayments(paymentsData.filter(p => !p.is_paid))
    setHistory(historyData)
    setAccessCode(settings)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const data = await response.json()
      
      if (data.valid) {
        setIsAuthenticated(true)
      } else {
        alert('Mot de passe incorrect')
      }
    } catch (error) {
      console.error('Error verifying password:', error)
      alert('Erreur lors de la vérification du mot de passe')
    }
  }

  const parseImportText = (text: string): Array<{ name: string; birth_date: string; amount: number; reason: string }> => {
    const lines = text.trim().split('\n')
    const results: Array<{ name: string; birth_date: string; amount: number; reason: string }> = []

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      // Si la ligne contient des tabulations, c'est du format Excel
      if (trimmedLine.includes('\t')) {
        const parts = trimmedLine.split('\t').map(p => p.trim())
        
        if (parts.length >= 3) {
          // Format Excel: "Nom, Prénom" [TAB] "JJ/MM/AAAA" [TAB] "Montant€"
          const name = parts[0]
          const birthDate = parts[1]
          // Nettoyer le montant: enlever €, espaces, et gérer virgule/point décimal
          const amountStr = parts[2].replace('€', '').replace(/\s/g, '').replace(',', '.')
          const amount = parseFloat(amountStr)
          const reason = parts.length > 3 ? parts.slice(3).join(' ') : 'Paiement'

          if (name && birthDate && !isNaN(amount)) {
            results.push({ name, birth_date: birthDate, amount, reason })
          }
        }
      } else {
        // Format CSV avec virgules: "Nom Prénom", "JJ/MM/AAAA", "Montant", "Motif"
        const parts = trimmedLine.split(',').map(p => p.trim())
        
        if (parts.length >= 3) {
          const name = parts[0]
          const birthDate = parts[1]
          const amountStr = parts[2].replace('€', '').replace(/\s/g, '').replace(',', '.')
          const amount = parseFloat(amountStr)
          const reason = parts.length > 3 ? parts.slice(3).join(', ') : 'Paiement'

          if (name && birthDate && !isNaN(amount)) {
            results.push({ name, birth_date: birthDate, amount, reason })
          }
        }
      }
    }

    return results
  }

  const handleImport = async () => {
    if (!importText.trim()) {
      alert('Veuillez entrer des données à importer')
      return
    }

    const parsedData = parseImportText(importText)
    
    if (parsedData.length === 0) {
      alert('Aucune donnée valide trouvée. Format attendu: Nom, Date (JJ/MM/AAAA), Montant, Raison')
      return
    }

    try {
      for (const data of parsedData) {
        await db.addPayment({
          ...data,
          is_paid: false
        })
      }
      
      alert(`${parsedData.length} paiement(s) importé(s) avec succès`)
      setImportText('')
      await loadData()
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      alert('Erreur lors de l\'import. Veuillez réessayer.')
    }
  }

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setImportText(text)
    }
    reader.readAsText(file)
  }

  const handleTogglePayment = (id: string) => {
    const newSelected = new Set(selectedPayments)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPayments(newSelected)
  }

  const handleToggleAll = () => {
    if (selectedPayments.size === payments.length) {
      setSelectedPayments(new Set())
    } else {
      setSelectedPayments(new Set(payments.map(p => p.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedPayments.size === 0) {
      alert('Aucun paiement sélectionné')
      return
    }

    if (confirm(`Supprimer ${selectedPayments.size} paiement(s) sélectionné(s) ?`)) {
      await db.deletePayments(Array.from(selectedPayments))
      setSelectedPayments(new Set())
      await loadData()
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    if (confirm('Marquer ce paiement comme payé ?')) {
      await db.markAsPaid(id)
      await loadData()
    }
  }

  const handleExportPayments = () => {
    // Préparer les données pour Excel
    const data = payments.map(p => ({
      'Nom': p.name,
      'Date de naissance': p.birth_date,
      'Montant': `${p.amount}€`,
      'Raison': p.reason,
      'Statut': p.is_paid ? 'Payé' : 'Non payé'
    }))

    // Créer un nouveau classeur Excel
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paiements')

    // Ajuster la largeur des colonnes
    const columnWidths = [
      { wch: 25 }, // Nom
      { wch: 18 }, // Date de naissance
      { wch: 12 }, // Montant
      { wch: 30 }, // Raison
      { wch: 12 }  // Statut
    ]
    worksheet['!cols'] = columnWidths

    // Générer et télécharger le fichier Excel
    const fileName = `paiements-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const handleUpdateAccessCode = async () => {
    if (!newAccessCode.trim()) {
      alert('Veuillez entrer un nouveau code d\'accès')
      return
    }

    await db.updateAccessCode(newAccessCode.trim())
    setAccessCode(newAccessCode.trim())
    setNewAccessCode('')
    setShowAccessCodeForm(false)
    alert('Code d\'accès mis à jour avec succès')
  }

  const handleDeletePayment = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      await db.deletePayment(id)
      loadData()
    }
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPaymentId(payment.id)
    setEditingName(payment.name)
    setEditingBirthDate(payment.birth_date)
    setEditingAmount(payment.amount.toString())
    setEditingReason(payment.reason)
  }

  const handleSaveEdit = async () => {
    if (!editingPaymentId) return
    
    const amount = parseFloat(editingAmount)
    if (isNaN(amount)) {
      alert('Veuillez entrer un montant valide')
      return
    }
    
    try {
      const response = await fetch(`/api/payments/${editingPaymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingName,
          birth_date: editingBirthDate,
          amount,
          reason: editingReason
        })
      })
      
      if (response.ok) {
        setEditingPaymentId(null)
        loadData()
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleCancelEdit = () => {
    setEditingPaymentId(null)
    setEditingName('')
    setEditingBirthDate('')
    setEditingAmount('')
    setEditingReason('')
  }

  const handleToggleHistory = (id: string, checked: boolean | "indeterminate") => {
    const newSelected = new Set(selectedHistory)
    if (checked === true) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedHistory(newSelected)
    setSelectedHistoryCount(newSelected.size)
  }

  const handleToggleAllHistory = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      const newSet = new Set(history.map(p => p.id))
      setSelectedHistory(newSet)
      setSelectedHistoryCount(newSet.size)
    } else {
      setSelectedHistory(new Set())
      setSelectedHistoryCount(0)
    }
  }

  const handleDeleteSelectedHistory = async () => {
    if (selectedHistory.size === 0) {
      alert('Aucun paiement sélectionné')
      return
    }

    if (confirm(`Supprimer ${selectedHistory.size} paiement(s) de l'historique ?`)) {
      await db.deletePayments(Array.from(selectedHistory))
      setSelectedHistory(new Set())
      setSelectedHistoryCount(0)
      await loadData()
    }
  }

  const handleSort = (column: 'name' | 'amount' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const sortedPayments = [...payments].sort((a, b) => {
    let comparison = 0
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy === 'amount') {
      comparison = a.amount - b.amount
    } else if (sortBy === 'date') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <div className="w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-t-lg py-6">
            <StudioLogo />
          </div>
          <CardHeader className="text-center">
            <CardTitle>Administration</CardTitle>
            <CardDescription>STUDIO e - Paiements</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Mot de passe administrateur</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez le mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg py-6 px-4">
          <StudioLogo />
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Historique des paiements ({history.length})</CardTitle>
                <CardDescription>
                  Paiements marqués comme réglés
                </CardDescription>
              </div>
              {selectedHistoryCount > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelectedHistory}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer ({selectedHistoryCount})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun paiement dans l'historique</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedHistory.size === history.length && history.length > 0}
                        onCheckedChange={(checked) => handleToggleAllHistory(checked)}
                      />
                    </TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date de naissance</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Date de paiement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedHistory.has(payment.id)}
                          onCheckedChange={(checked) => handleToggleHistory(payment.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{payment.name}</TableCell>
                      <TableCell>{payment.birth_date}</TableCell>
                      <TableCell className="font-semibold text-green-900">{payment.amount}€</TableCell>
                      <TableCell>{payment.reason}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {payment.paid_date ? new Date(payment.paid_date).toLocaleString('fr-FR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Paiements en attente ({payments.length})</CardTitle>
                <CardDescription>
                  Montants non encore réglés
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {selectedPayments.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer ({selectedPayments.size})
                  </Button>
                )}
                {payments.length > 0 && (
                  <Button onClick={handleExportPayments} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter Excel
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun paiement en attente</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPayments.size === payments.length && payments.length > 0}
                        onCheckedChange={handleToggleAll}
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('name')}>
                      Nom {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Date de naissance</TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('amount')}>
                      Montant {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.map((payment) => {
                    const isEditing = editingPaymentId === payment.id
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPayments.has(payment.id)}
                            onCheckedChange={() => handleTogglePayment(payment.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {isEditing ? (
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            payment.name
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingBirthDate}
                              onChange={(e) => setEditingBirthDate(e.target.value)}
                              placeholder="JJ/MM/AAAA"
                              className="w-32"
                            />
                          ) : (
                            payment.birth_date
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-blue-900">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editingAmount}
                              onChange={(e) => setEditingAmount(e.target.value)}
                              className="w-24"
                              step="0.01"
                            />
                          ) : (
                            `${payment.amount}€`
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingReason}
                              onChange={(e) => setEditingReason(e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            payment.reason
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveEdit}
                                title="Enregistrer"
                              >
                                ✓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                title="Annuler"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleMarkAsPaid(payment.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Payé
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPayment(payment)}
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePayment(payment.id)}
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importer des paiements</CardTitle>
            <CardDescription>
              Format: Nom, Date de naissance (JJ/MM/AAAA), Montant, Raison
              <br />
              Exemple: Marie Dupont, 15/03/2010, 150, Cours de danse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fileImport" className="text-sm font-medium mb-2 block">
                Option 1 : Importer un fichier (CSV, Excel, TXT)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="fileImport"
                  type="file"
                  accept=".csv,.txt,.xlsx,.xls"
                  onChange={handleFileImport}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Ou</span>
              </div>
            </div>

            <div>
              <Label htmlFor="textImport" className="text-sm font-medium mb-2 block">
                Option 2 : Copier-coller du texte
              </Label>
              <Textarea
                id="textImport"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Marie Dupont, 15/03/2010, 150, Cours de danse&#10;Paul Martin, 20/05/2012, 200, Concours"
                rows={6}
              />
              <Button onClick={handleImport} className="mt-2">
                <Upload className="w-4 h-4 mr-2" />
                Importer les données
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>
              Code d'accès pour l'application utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Code d'accès actuel</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input value={accessCode} disabled className="flex-1" />
                <Button
                  variant="outline"
                  onClick={() => setShowAccessCodeForm(!showAccessCodeForm)}
                >
                  Modifier
                </Button>
              </div>
            </div>

            {showAccessCodeForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <Label htmlFor="newAccessCode">Nouveau code d'accès</Label>
                <Input
                  id="newAccessCode"
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value)}
                  placeholder="Entrez le nouveau code"
                />
                <div className="flex gap-2">
                  <Button onClick={handleUpdateAccessCode}>
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAccessCodeForm(false)
                      setNewAccessCode('')
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Lien de l'application</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded border border-blue-200">
              <code className="text-sm">
                {typeof window !== 'undefined' ? window.location.origin : '/'}
              </code>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Partagez ce lien aux parents pour qu'ils puissent consulter leurs montants
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

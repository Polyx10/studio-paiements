import { neon } from '@neondatabase/serverless'

// Ce script ajoute des paiements de test pour valider la suppression groupée
// À exécuter UNIQUEMENT sur l'environnement de staging

const DATABASE_URL = process.env.POSTGRES_URL

if (!DATABASE_URL) {
  console.error('❌ POSTGRES_URL non définie')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function addTestPayments() {
  try {
    console.log('🔄 Ajout de paiements de test...')

    // Créer 5 paiements de test déjà marqués comme payés
    const testPayments = [
      {
        name: '🧪 TEST - Alice Martin',
        birth_date: '15/03/2010',
        amount: 150,
        reason: 'TEST - Cours de danse',
        is_paid: true
      },
      {
        name: '🧪 TEST - Bob Dupont',
        birth_date: '20/05/2012',
        amount: 200,
        reason: 'TEST - Concours',
        is_paid: true
      },
      {
        name: '🧪 TEST - Charlie Leblanc',
        birth_date: '10/08/2011',
        amount: 180,
        reason: 'TEST - Stage été',
        is_paid: true
      },
      {
        name: '🧪 TEST - Diana Rousseau',
        birth_date: '25/01/2013',
        amount: 120,
        reason: 'TEST - Inscription',
        is_paid: true
      },
      {
        name: '🧪 TEST - Ethan Bernard',
        birth_date: '05/09/2009',
        amount: 250,
        reason: 'TEST - Spectacle',
        is_paid: true
      }
    ]

    const now = new Date().toISOString()

    for (const payment of testPayments) {
      await sql`
        INSERT INTO payments (name, birth_date, amount, reason, is_paid, paid_date)
        VALUES (${payment.name}, ${payment.birth_date}, ${payment.amount}, ${payment.reason}, ${payment.is_paid}, ${now})
      `
      console.log(`✅ Paiement ajouté: ${payment.name} - ${payment.amount}€`)
    }

    console.log('\n✅ 5 paiements de test ajoutés avec succès dans l\'historique!')
    console.log('📝 Ces paiements sont identifiables par le préfixe "🧪 TEST -"')
    console.log('🗑️  Tu peux maintenant tester la suppression groupée sur ces données')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des paiements de test:', error)
    process.exit(1)
  }
}

addTestPayments()

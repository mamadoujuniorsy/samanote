import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Brain, CheckCircle2, FileText, Sparkles, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#37352F]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F7F7F5]/80 backdrop-blur-md border-b border-[#E0E0E0]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#007AFF] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SamaNote</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-sm font-medium hover:text-[#007AFF] transition-colors">
              Se connecter
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-[#007AFF] hover:bg-[#0056B3] text-white">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#007AFF] text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Propulsé par l'Intelligence Artificielle</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Vos études, <br />
            <span className="text-[#007AFF]">super-chargées.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            SamaNote transforme vos cours en fiches de révision, quiz et résumés instantanés grâce à l'IA. 
            Concentrez-vous sur l'apprentissage, on s'occupe de l'organisation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-[#007AFF] hover:bg-[#0056B3] text-white h-12 px-8 text-lg">
                Essayer gratuitement <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg bg-white hover:bg-gray-50">
                Voir la démo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white border-y border-[#E0E0E0]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin pour réussir</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une suite d'outils intelligents conçus pour optimiser votre temps de révision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-[#F7F7F5] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-[#007AFF]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Assistant IA Personnel</h3>
              <p className="text-gray-600 leading-relaxed">
                Posez des questions sur vos cours, demandez des explications ou générez des exemples concrets instantanément.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-[#F7F7F5] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Analyse de PDF</h3>
              <p className="text-gray-600 leading-relaxed">
                Importez vos cours en PDF. SamaNote les analyse, extrait les points clés et crée des fiches de révision automatiquement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-[#F7F7F5] hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quiz Intelligents</h3>
              <p className="text-gray-600 leading-relaxed">
                Testez vos connaissances avec des quiz générés sur mesure à partir de vos propres notes et documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#007AFF] mb-2">10k+</div>
              <div className="text-sm text-gray-600 font-medium">Étudiants actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#007AFF] mb-2">50k+</div>
              <div className="text-sm text-gray-600 font-medium">Notes créées</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#007AFF] mb-2">1M+</div>
              <div className="text-sm text-gray-600 font-medium">Questions générées</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#007AFF] mb-2">4.9/5</div>
              <div className="text-sm text-gray-600 font-medium">Note moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#37352F] text-white px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à transformer votre façon d'apprendre ?</h2>
          <p className="text-gray-300 mb-10 text-lg max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui utilisent déjà SamaNote pour réussir leurs examens.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-[#007AFF] hover:bg-[#0056B3] text-white h-14 px-8 text-lg w-full sm:w-auto">
                Créer un compte gratuit
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Pas de carte bancaire requise
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Annulable à tout moment
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#E0E0E0] bg-white">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#007AFF] rounded flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-[#37352F]">SamaNote</span>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} SamaNote. Tous droits réservés.
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="#" className="hover:text-[#007AFF]">Confidentialité</Link>
            <Link href="#" className="hover:text-[#007AFF]">Conditions</Link>
            <Link href="#" className="hover:text-[#007AFF]">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

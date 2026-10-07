import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Magazine from './pages/Magazine.jsx'
import ArticleDetail from './pages/ArticleDetail.jsx'
import PourquoiEtreJociste from './pages/PourquoiEtreJociste.jsx'
import VieDansLaJOC from './pages/VieDansLaJOC.jsx'
import EchoAudio from './pages/EchoAudio.jsx'
import Videos from './pages/Videos.jsx'
import Events from './pages/Events.jsx'
import EventDetail from './pages/EventDetail.jsx'
import Equipe from './pages/Equipe.jsx'
import FamilleJOC from './pages/FamilleJOC.jsx'
import Contact from './pages/Contact.jsx'
import SearchPage from './pages/SearchPage.jsx'
import EspaceEchange from './pages/EspaceEchange.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<Admin />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/magazine" element={<Magazine />} />
        <Route path="/magazine/:slug" element={<ArticleDetail />} />
        <Route path="/pourquoi-etre-jociste" element={<PourquoiEtreJociste />} />
        <Route path="/la-vie-dans-la-joc" element={<VieDansLaJOC />} />
        <Route path="/echo-audio" element={<EchoAudio />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/evenements" element={<Events />} />
        <Route path="/evenements/:slug" element={<EventDetail />} />
        <Route path="/equipe" element={<Equipe />} />
        <Route path="/famille-joc" element={<FamilleJOC />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/recherche" element={<SearchPage />} />
        <Route path="/espace-echange" element={<EspaceEchange />} />
      </Route>
    </Routes>
  )
}

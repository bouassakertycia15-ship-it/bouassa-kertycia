import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Splash from './components/Splash.jsx'
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
import Forum from './pages/Forum.jsx'
import ForumDiscussion from './pages/ForumDiscussion.jsx'
import NewDiscussion from './pages/NewDiscussion.jsx'
import AuthPage from './pages/AuthPage.jsx'
import MonEspace from './pages/MonEspace.jsx'
import StaticPage from './pages/StaticPage.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const [showSplash, setShowSplash] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!sessionStorage.getItem('splash_shown') && location.pathname === '/') {
      setShowSplash(true)
      sessionStorage.setItem('splash_shown', 'true')
    }
  }, [location.pathname])

  return (
    <>
      {showSplash && <Splash onDone={() => setShowSplash(false)} />}
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/connexion" element={<AuthPage />} />
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
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:slug" element={<ForumDiscussion />} />
          <Route path="/forum/nouvelle-discussion" element={<NewDiscussion />} />
          <Route path="/mon-espace" element={<MonEspace />} />
          <Route path="/a-propos" element={<StaticPage slug="a-propos" title="À propos" />} />
          <Route path="/confidentialite" element={<StaticPage slug="confidentialite" title="Confidentialité" />} />
          <Route path="/mentions-legales" element={<StaticPage slug="mentions-legales" title="Mentions légales" />} />
        </Route>
      </Routes>
    </>
  )
}

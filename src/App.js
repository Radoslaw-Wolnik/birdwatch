import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import BirdsAll from './BirdsAll';
import LogIn from './LogIn';
import Profile from './Profile';
import Feed from './Feed';
import About from './About';
import Footer from './Footer'; 
import SignUp from './SignUp';
import BirdPage from './BirdPage';
import MapPage from './MapPage';
import NewPostPage from './NewPostPage';
import ModeratorPage from './ModeratorPage';
import Friends from './Friends';
import Credits from './Credits';

import ForgotPassword from './ForgotPassword';
import UpdatePassword from './UpdatePassword';

import UserManagement from './UserManagement';
import PostManagement from './PostManagement';
import BirdManagement from './BirdsManagement';
import CreditsManagement from './CreditsManagement';

import { SupabaseProvider } from './SupabaseContext';


const App = () => {
  return (
    <Router>
      <SupabaseProvider>
        <div className="app">
          <Navbar />

          <Switch>

            <Route path="/moderate" component={ModeratorPage} />
            <Route path="/admin/..." component={ModeratorPage} />
            <Route path="/dev/management/users" component={UserManagement} />
            <Route path="/dev/management/posts" component={PostManagement} />
            <Route path="/dev/management/birds" component={BirdManagement} />
            <Route path="/dev/management/credits" component={CreditsManagement} />

            <Route exact path="/birds" component={BirdsAll} />
            <Route path="/bird/:link" component={BirdPage} />
            <Route path="/map/:lat/:lng" component={MapPage} />
            <Route exact path="/map" component={MapPage} />
            <Route path="/about" component={About} />
            <Route path="/credits" component={Credits} />

            <Route path="/signup" component={SignUp} />
            <Route path="/login" component={LogIn} />

            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/update-password" component={UpdatePassword} />

            <Route path="/profile/:username" component={Profile} />
            <Route path="/profile" component={Profile} />
            <Route path="/friends" component={Friends} />
            <Route path="/feed" component={Feed} />
            <Route path="/new-post" component={NewPostPage} />

            <Route exact path="/" component={Home} />
          </Switch>

          <Footer />
        </div>

      </SupabaseProvider>
    </Router>
    
  );
};

export default App;
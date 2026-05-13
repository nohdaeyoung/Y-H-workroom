/* global React, ReactDOM */

function App() {
  const route = window.useRoute();
  const { path, segments, go } = route;
  // Force re-render when user changes
  const [, forceTick] = React.useState(0);
  React.useEffect(() => {
    const fn = () => forceTick((x) => x + 1);
    window.addEventListener('user-changed', fn);
    return () => window.removeEventListener('user-changed', fn);
  }, []);

  // 스크롤 탑 on route change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [path]);

  let page;
  const isLogin = path === '/login';
  const isAdmin = path.startsWith('/admin');

  if (path === '/' || path === '') page = <window.HomePage />;
  else if (path === '/login') page = <window.LoginPage go={go} />;
  else if (path === '/about') page = <window.AboutPage />;
  else if (path === '/essay') page = <window.EssayListPage go={go} />;
  else if (path === '/essay/write') page = <window.EssayWritePage go={go} />;
  else if (segments[0] === 'essay' && segments[1]) page = <window.EssayDetailPage id={segments[1]} />;
  else if (path === '/relay') page = <window.RelayListPage />;
  else if (path === '/relay/new') page = <window.RelayNewPage />;
  else if (segments[0] === 'relay' && segments[1]) page = <window.RelayDetailPage id={segments[1]} />;
  else if (path === '/keyword') page = <window.KeywordListPage />;
  else if (segments[0] === 'keyword' && segments[1]) page = <window.KeywordDetailPage id={segments[1]} />;
  else if (path === '/bookclub') page = <window.BookclubListPage />;
  else if (segments[0] === 'bookclub' && segments[1]) page = <window.BookclubDetailPage id={segments[1]} />;
  else if (path === '/photostory') page = <window.PhotostoryListPage />;
  else if (segments[0] === 'photostory' && segments[1]) page = <window.PhotostoryDetailPage id={segments[1]} />;
  else if (path === '/admin') page = <window.AdminHomePage />;
  else if (path === '/admin/my' || (segments[0] === 'admin' && segments[1] === 'my')) page = <window.AdminMyPage section={segments[2] || 'essay'} />;
  else if (path === '/admin/about') page = <window.AdminAboutPage />;
  else if (path === '/admin/account') page = <window.AdminAccountPage />;
  else page = (
    <div className="container narrow" style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 48 }}>🌿</div>
      <h2 className="serif" style={{ marginTop: 12, fontSize: 24 }}>찾을 수 없는 페이지예요</h2>
      <a href="#/" className="btn" style={{ marginTop: 16 }}>홈으로</a>
    </div>
  );

  return (
    <div className="app" data-screen-label={`route: ${path}`}>
      {!isLogin && <window.Header path={path} />}
      <main className="content">{page}</main>
      {!isLogin && <window.Tabbar path={path} />}
      <window.UserSwitcher />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

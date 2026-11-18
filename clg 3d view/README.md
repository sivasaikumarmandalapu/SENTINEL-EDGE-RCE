# RCEE Campus – standalone 3D page

Run:   npm install && npm run dev
Open:  http://localhost:5173/college-campus   (any path works; "/" too)

All code is in src/campus/. Layout, sizes, floors, colours, roads, entrance and camera
are in src/campus/config.js (map pixels -> world units via MAP_SCALE).

To mount inside an existing Vite/React-Router app WITHOUT touching its pages:
  copy src/campus/ into the app, then add one lazy route:
  <Route path="/college-campus" element={<CampusPage/>} />   // import from './campus/CampusPage'
The page injects its own scoped CSS and uses only react, three, @react-three/fiber, @react-three/drei.

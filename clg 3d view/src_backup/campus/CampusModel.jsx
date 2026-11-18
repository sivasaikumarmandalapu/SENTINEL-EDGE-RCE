import React from 'react';
import { ABlock, AdminBlock, BBlock, BoysHostel, Canteen, CBlock, GirlsHostel } from './Blocks';
import Auditorium from './Auditorium';
import Temple from './Temple';
import OpenAuditorium from './OpenAuditorium';
import MechanicalLab from './MechanicalLab';
import MainEntrance from './MainEntrance';
import { GATE2 } from './config';
import { BoundaryWall, CampusGround, InternalRoads, ParkingAndVehicles, TreesAndLandscaping } from './Environment';

export const STRUCTURES = [
  ['admin', AdminBlock], ['a', ABlock], ['b', BBlock], ['c', CBlock], ['temple', Temple], ['canteen', Canteen],
  ['openAuditorium', OpenAuditorium], ['auditorium', Auditorium], ['girls', GirlsHostel], ['boys', BoysHostel],
  ['mechlab', MechanicalLab],
];

/** Everything that lives inside the <Canvas>. Self-contained: no app state, no external styles. */
export default function CampusModel({ selectedId = null, onSelect, onHover, statuses = {}, showLabels = false }) {
  return (
    <group name="rcee-campus">
      <CampusGround />
      <InternalRoads />
      <BoundaryWall />
      <MainEntrance showSign={false} />
      <MainEntrance position={[GATE2.x, 0, GATE2.z]} rotationY={GATE2.rotationY} halfSpan={GATE2.halfSpan} scale={GATE2.scale} />
      {STRUCTURES.map(([id, C]) => (
        <C key={id} status={statuses[id]} selected={selectedId === id} onSelect={onSelect} onHover={onHover} showLabel={showLabels || selectedId === id} />
      ))}
      <TreesAndLandscaping />
      <ParkingAndVehicles />
    </group>
  );
}

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  MarkerType, Panel, Handle, Position,
  getBezierPath, EdgeLabelRenderer, BaseEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { motion } from 'framer-motion';
import Cropper from 'react-easy-crop';
import {
  Users, Heart, Trash2, UserPlus, Edit3, Save,
  Calendar, Camera, Link2, ZoomIn, ZoomOut,
  RotateCcw, GitBranch, Sparkles
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import PageHeader from '../components/ui/PageHeader';
import BaseDialog from '../components/ui/BaseDialog';
import api from '../utils/api';
import './FamilyTreePage.scss';

// ─── Helpers ──────────────────────────────────────────────────
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!pixelCrop) return imageSrc;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

// ─── Constants ────────────────────────────────────────────────
const DEPTH_PAL = [
  { accent: '#0071e3', bg: 'rgba(0,113,227,0.09)', tag: '#0071e3' },
  { accent: '#10b981', bg: 'rgba(16,185,129,0.09)', tag: '#059669' },
  { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.09)', tag: '#7c3aed' },
  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.09)', tag: '#d97706' },
  { accent: '#ec4899', bg: 'rgba(236,72,153,0.09)', tag: '#db2777' },
];

const AVATAR_COLORS = ['#0071e3','#10b981','#8b5cf6','#f59e0b','#ec4899','#ef4444','#06b6d4','#6366f1'];

const RELATIONS = [
  'Father','Mother','Son','Daughter','Husband','Wife','Spouse',
  'Grandfather','Grandmother','Grandson','Granddaughter',
  'Brother','Sister','Uncle','Aunt','Nephew','Niece','Cousin',
  'Father-in-law','Mother-in-law','Brother-in-law','Sister-in-law','Other'
];

const RELATION_EDGE_COLORS = {
  parent: '#0071e3', spouse: '#ff4d6d', child: '#10b981', default: '#94a3b8'
};

// ─── Helpers ──────────────────────────────────────────────────
const getId = m => m?._id || m?.id || '';
const isReal = v => v && v !== 'NONE' && v !== 'null' && v !== 'None';

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(n => n[0] || '').join('').substring(0, 2).toUpperCase() || '?';
}

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getPaletteForRelation(relation) {
  const r = (relation || '').toLowerCase();
  if (r.includes('father') || r.includes('grandfather')) return DEPTH_PAL[0];
  if (r.includes('mother') || r.includes('grandmother')) return DEPTH_PAL[4];
  if (r.includes('son') || r.includes('grandson')) return DEPTH_PAL[1];
  if (r.includes('daughter') || r.includes('granddaughter')) return DEPTH_PAL[2];
  if (r.includes('wife') || r.includes('husband') || r.includes('spouse')) return DEPTH_PAL[4];
  if (r.includes('brother') || r.includes('uncle')) return DEPTH_PAL[3];
  if (r.includes('sister') || r.includes('aunt')) return DEPTH_PAL[2];
  return DEPTH_PAL[Math.abs((relation||'').charCodeAt(0)||0) % DEPTH_PAL.length];
}

// ─── Auto-layout (simple hierarchical) ───────────────────────
function computeLayout(members) {
  const byId = {};
  members.forEach(m => { byId[getId(m)] = m; });

  // Build children map
  const childrenOf = {};
  members.forEach(m => { childrenOf[getId(m)] = []; });
  members.forEach(m => {
    const mId = getId(m);
    [m.fatherId, m.motherId, m.parentId].filter(isReal).forEach(pId => {
      if (byId[pId] && !childrenOf[pId].find(c => getId(c) === mId))
        childrenOf[pId].push(m);
    });
  });

  // Spouse map
  const spouseOf = {};
  members.forEach(m => {
    if (isReal(m.spouseId) && byId[m.spouseId]) {
      spouseOf[getId(m)] = byId[m.spouseId];
      spouseOf[m.spouseId] = m;
    }
  });
  members.forEach(m => {
    if (isReal(m.fatherId) && isReal(m.motherId) && byId[m.fatherId] && byId[m.motherId]) {
      const [f, mo] = [m.fatherId, m.motherId];
      if (!spouseOf[f]) { spouseOf[f] = byId[mo]; spouseOf[mo] = byId[f]; }
    }
  });

  // Roots
  const nonRoot = new Set();
  members.forEach(m => {
    if (isReal(m.fatherId) || isReal(m.motherId) || isReal(m.parentId)) nonRoot.add(getId(m));
  });
  members.forEach(m => {
    const mId = getId(m);
    if (nonRoot.has(mId)) return;
    const sp = spouseOf[mId];
    if (sp && (isReal(sp.fatherId) || isReal(sp.motherId))) nonRoot.add(mId);
  });

  let roots = members.filter(m => !nonRoot.has(getId(m)));
  const seenRoot = new Set();
  const dedupedRoots = [];
  roots.forEach(m => {
    const mId = getId(m);
    if (seenRoot.has(mId)) return;
    seenRoot.add(mId);
    const sp = spouseOf[mId];
    if (sp) seenRoot.add(getId(sp));
    dedupedRoots.push(m);
  });
  if (dedupedRoots.length === 0 && members.length > 0) dedupedRoots.push(members[0]);

  // BFS layout
  const CARD_W = 200, CARD_H = 200, H_GAP = 60, V_GAP = 120;
  const positions = {};
  const placed = new Set();

  function placeNode(mId, x, y) {
    if (placed.has(mId)) return;
    placed.add(mId);
    positions[mId] = { x, y };

    const sp = spouseOf[mId];
    if (sp) {
      const sId = getId(sp);
      if (!placed.has(sId)) {
        placed.add(sId);
        positions[sId] = { x: x + CARD_W + H_GAP, y };
      }
    }

    const myId = mId;
    const spId = sp ? getId(sp) : null;
    const seen = new Set();
    const children = [];
    [...(childrenOf[myId] || []), ...(spId ? childrenOf[spId] || [] : [])].forEach(c => {
      const cId = getId(c);
      if (!seen.has(cId)) { seen.add(cId); children.push(c); }
    });

    if (children.length > 0) {
      const totalW = children.length * CARD_W + (children.length - 1) * H_GAP;
      const startX = x + (sp ? CARD_W / 2 + H_GAP / 4 : 0) - totalW / 2 + CARD_W / 2;
      children.forEach((c, i) => {
        const cId = getId(c);
        if (!placed.has(cId)) {
          placeNode(cId, startX + i * (CARD_W + H_GAP), y + CARD_H + V_GAP);
        }
      });
    }
  }

  let rootX = 60;
  dedupedRoots.forEach(root => {
    const rId = getId(root);
    if (!placed.has(rId)) {
      placeNode(rId, rootX, 60);
      rootX += CARD_W * 2 + H_GAP * 4;
    }
  });

  // Place any remaining unplaced
  let fallbackX = rootX;
  members.forEach(m => {
    const mId = getId(m);
    if (!placed.has(mId)) {
      positions[mId] = { x: fallbackX, y: 60 };
      fallbackX += CARD_W + H_GAP;
    }
  });

  return { positions, spouseOf, childrenOf };
}

// ─── Custom Node ──────────────────────────────────────────────
function MemberNode({ data, selected }) {
  const { member, onEdit, onDelete } = data;
  const pal = getPaletteForRelation(member.relation);
  const color = getAvatarColor(member.name);
  const initials = getInitials(member.name);
  const [imgErr, setImgErr] = useState(false);
  const hasPhoto = member.photo && !imgErr;

  return (
    <div className={`ft-flow-card ${selected ? 'selected' : ''} ${hasPhoto ? 'has-photo' : ''}`}
      style={{ 
        '--accent': pal.accent, 
        '--acc-bg': pal.bg,
        backgroundImage: hasPhoto ? `url(${member.photo})` : 'none'
      }}>

      {/* Handles for connections */}
      <Handle type="target" position={Position.Top}    className="ft-handle" id="top" />
      <Handle type="target" position={Position.Left}   className="ft-handle" id="left" />
      <Handle type="source" position={Position.Bottom} className="ft-handle" id="bottom" />
      <Handle type="source" position={Position.Right}  className="ft-handle" id="right" />

      {/* Relation tag */}
      <div className="ft-flow-tag" style={{ background: pal.tag }}>
        {(member.relation || 'Member').toUpperCase()}
      </div>

      {/* Avatar (only if no background photo) */}
      {!hasPhoto && (
        <div className="ft-flow-avatar" style={{ background: `${color}15`, border: `2px solid ${color}40` }}>
          <span style={{ color, fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{initials}</span>
        </div>
      )}

      <div className="ft-flow-info">
        <div className="ft-flow-name">{member.name}</div>
        <div className="ft-flow-age"><Calendar size={11} />{member.age} yrs</div>
      </div>

      {/* Actions */}
      <div className="ft-flow-actions">
        <button className="ft-flow-btn edit" onClick={e => { e.stopPropagation(); onEdit(member); }} title="Edit">
          <Edit3 size={12} />
        </button>
        <button className="ft-flow-btn del" onClick={e => { e.stopPropagation(); onDelete(getId(member)); }} title="Delete">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Custom Edge (with label) ─────────────────────────────────
function RelationEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div className="ft-edge-label" style={{ transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }}>
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = { memberNode: MemberNode };
const edgeTypes = { relationEdge: RelationEdge };

function buildFlowData(members, onEdit, onDelete, savedPositions = {}) {
  const { positions = {}, spouseOf = {}, childrenOf = {} } = computeLayout(members) || {};

  const nodes = (Array.isArray(members) ? members : []).map(m => {
    const mId = getId(m);
    const pos = savedPositions[mId] || positions[mId] || { x: 0, y: 0 };
    return {
      id: mId,
      type: 'memberNode',
      position: pos,
      data: { member: m, onEdit, onDelete },
      draggable: true,
    };
  });

  const edges = [];
  const seenEdges = new Set();

  const addEdgeIfNew = (src, tgt, type, label, color) => {
    const key = [src, tgt].sort().join('--') + type;
    if (seenEdges.has(key) || !src || !tgt || src === tgt) return;
    seenEdges.add(key);
    edges.push({
      id: `e-${src}-${tgt}-${type}`,
      source: src, target: tgt,
      type: 'relationEdge',
      data: { label },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
      style: { stroke: color, strokeWidth: 2 },
      animated: type === 'spouse',
    });
  };

  members.forEach(m => {
    const mId = getId(m);
    if (isReal(m.fatherId)) addEdgeIfNew(m.fatherId, mId, 'parent', '', RELATION_EDGE_COLORS.parent);
    if (isReal(m.motherId)) addEdgeIfNew(m.motherId, mId, 'parent', '', RELATION_EDGE_COLORS.parent);
    if (isReal(m.parentId) && !isReal(m.fatherId) && !isReal(m.motherId))
      addEdgeIfNew(m.parentId, mId, 'parent', '', RELATION_EDGE_COLORS.parent);
    if (isReal(m.spouseId)) addEdgeIfNew(mId, m.spouseId, 'spouse', '❤', RELATION_EDGE_COLORS.spouse);
  });

  return { nodes, edges };
}

// ─── Crop Dialog ──────────────────────────────────────────────
function CropDialog({ src, onCrop, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    try {
      const blob = await getCroppedImg(src, croppedAreaPixels);
      onCrop(blob);
    } catch (e) {
      console.error("CROP ERROR:", e);
    }
  };

  return (
    <BaseDialog open={!!src} onClose={onCancel} title="✂️ Adjust Photo" maxWidth="xs">
      <div className="ft-crop-container">
        <div className="ft-crop-area">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            minZoom={0.5}
            objectFit="contain"
          />
        </div>
        <div className="ft-crop-controls">
          <div className="ft-zoom-row">
            <ZoomOut size={14} />
            <input
              type="range"
              value={zoom}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="ft-zoom-slider"
            />
            <ZoomIn size={14} />
          </div>
          <p className="ft-crop-hint">Drag to move, use slider to zoom</p>
        </div>
        <div className="ft-crop-actions" style={{ padding: '0 1.5rem 1.5rem' }}>
          <button className="ft-crop-btn cancel" onClick={onCancel}>Cancel</button>
          <button className="ft-crop-btn save" onClick={handleDone}>Save Crop</button>
        </div>
      </div>
    </BaseDialog>
  );
}

// ─── Add/Edit Dialog ──────────────────────────────────────────
function MemberDialog({ open, onClose, members, onSave, editMember }) {
  const isEdit = !!editMember;
  const blank = { name: '', age: '', relation: 'Son', fatherId: 'NONE', motherId: 'NONE', spouseId: 'NONE', photo: '' };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [photoMode, setPhotoMode] = useState('url');
  const [tempPhoto, setTempPhoto] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (!open) return;
    setForm(editMember ? {
      name: editMember.name || '',
      age: String(editMember.age || ''),
      relation: editMember.relation || 'Son',
      fatherId: editMember.fatherId || 'NONE',
      motherId: editMember.motherId || 'NONE',
      spouseId: editMember.spouseId || 'NONE',
      photo: editMember.photo || '',
    } : blank);
  }, [editMember, open]); // eslint-disable-line

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setTempPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const onCropDone = async (blob) => {
    setTempPhoto(null);
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'avatar.jpg');
      const res = await api.post('/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set('photo', res.data.url);
    } catch (e) {
      console.error("UPLOAD ERROR:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.age) return;
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  };

  const editId = editMember ? getId(editMember) : null;
  const opts = members.filter(m => getId(m) !== editId);
  const avatarColor = getAvatarColor(form.name);
  const [imgPreviewErr, setImgPreviewErr] = useState(false);
  useEffect(() => setImgPreviewErr(false), [form.photo]);

  return (
    <BaseDialog open={open} onClose={onClose} title={isEdit ? '✏️ Edit Member' : '➕ Add Family Member'} maxWidth="sm">
      <div className="ft-form">
        <CropDialog src={tempPhoto} onCrop={onCropDone} onCancel={() => setTempPhoto(null)} />
        {/* Photo section */}
        <div className="ft-form-photo-row">
          <div className="ft-form-avatar-wrap">
            <div className="ft-form-avatar" style={{ background: `${avatarColor}15`, border: `2px solid ${avatarColor}40` }}>
              {form.photo && !imgPreviewErr ? (
                <img src={form.photo} alt="" onError={() => setImgPreviewErr(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <span style={{ color: avatarColor, fontWeight: 900, fontSize: '1.6rem' }}>{getInitials(form.name)}</span>
              )}
            </div>
            <button className="ft-form-cam-btn" onClick={() => fileRef.current?.click()} title="Upload">
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </div>

          <div className="ft-form-photo-opts">
            <div className="ft-photo-tabs">
              <button className={'ft-photo-tab' + (photoMode === 'file' ? ' active' : '')}
                onClick={() => { setPhotoMode('file'); fileRef.current?.click(); }}>
                <Camera size={12} /> Upload
              </button>
              <button className={'ft-photo-tab' + (photoMode === 'url' ? ' active' : '')}
                onClick={() => setPhotoMode('url')}>
                <Link2 size={12} /> URL
              </button>
            </div>
            {photoMode === 'url' && (
              <input className="ft-photo-url"
                value={form.photo} onChange={e => set('photo', e.target.value)}
                placeholder="Paste image URL..." />
            )}
            {form.photo && (
              <button className="ft-photo-rm" onClick={() => { set('photo', ''); setImgPreviewErr(false); }}>
                ✕ Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="ft-form-field">
          <label>FULL NAME</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter full name..." autoFocus />
        </div>

        <div className="ft-form-row2">
          <div className="ft-form-field">
            <label>AGE</label>
            <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="0" min="0" max="120" />
          </div>
          <div className="ft-form-field">
            <label>RELATION</label>
            <select value={form.relation} onChange={e => set('relation', e.target.value)}>
              {RELATIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="ft-form-row2">
          <div className="ft-form-field">
            <label>FATHER</label>
            <select value={form.fatherId} onChange={e => set('fatherId', e.target.value)}>
              <option value="NONE">— None —</option>
              {opts.map(m => <option key={getId(m)} value={getId(m)}>{m.name}</option>)}
            </select>
          </div>
          <div className="ft-form-field">
            <label>MOTHER</label>
            <select value={form.motherId} onChange={e => set('motherId', e.target.value)}>
              <option value="NONE">— None —</option>
              {opts.map(m => <option key={getId(m)} value={getId(m)}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <div className="ft-form-field">
          <label>SPOUSE / PARTNER</label>
          <select value={form.spouseId} onChange={e => set('spouseId', e.target.value)}>
            <option value="NONE">— None —</option>
            {opts.map(m => <option key={getId(m)} value={getId(m)}>{m.name} ({m.relation})</option>)}
          </select>
        </div>

        <button className="ft-form-save" onClick={handleSave} disabled={saving || !form.name.trim() || !form.age}>
          {saving
            ? <CircularProgress size={16} thickness={5} sx={{ color: 'white' }} />
            : <><Save size={15} /> {isEdit ? 'Update Member' : 'Add to Tree'}</>}
        </button>
      </div>
    </BaseDialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function FamilyTreePage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [nodePositions, setNodePositions] = useState({});
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/family');
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); setMembers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleEdit = useCallback(m => { setEditMember(m); setShowForm(true); }, []);
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Remove this member?')) return;
    await api.delete('/family/' + id);
    fetchMembers();
  }, [fetchMembers]);

  // Rebuild flow when members change
  useEffect(() => {
    if (loading) return;
    const { nodes: newNodes, edges: newEdges } = buildFlowData(members, handleEdit, handleDelete, nodePositions);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [members, loading, nodePositions, handleEdit, handleDelete]); // eslint-disable-line

  // Save node positions when dragged
  const onNodeDragStop = useCallback((_, node) => {
    setNodePositions(prev => ({ ...prev, [node.id]: node.position }));
  }, []);

  // Allow drawing new connections
  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({
      ...params,
      type: 'relationEdge',
      animated: false,
      style: { stroke: '#0071e3', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#0071e3', width: 16, height: 16 },
      data: { label: '' },
    }, eds));
  }, [setEdges]);

  const handleSave = async (form) => {
    const payload = {
      ...form, age: parseInt(form.age) || 0,
      fatherId: form.fatherId === 'NONE' ? null : form.fatherId,
      motherId: form.motherId === 'NONE' ? null : form.motherId,
      spouseId: form.spouseId === 'NONE' ? null : form.spouseId,
    };
    if (editMember) await api.put('/family/' + getId(editMember), payload);
    else await api.post('/family', payload);
    setEditMember(null);
    fetchMembers();
  };

  const resetLayout = () => {
    setNodePositions({});
    const { nodes: newNodes, edges: newEdges } = buildFlowData(members, handleEdit, handleDelete, {});
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const couples = useMemo(() => Math.floor(members.filter(m => isReal(m.spouseId)).length / 2), [members]);

  return (
    <div className="ft-page">
      <PageHeader title="Heritage Nexus" subtitle="Family Lineage Visualization" />

      {!loading && members.length > 0 && (
        <div className="ft-stats-bar">
          <div className="ft-stat-pill blue"><Users size={13} />{members.length} Members</div>
          <div className="ft-stat-pill green">🌳 {Math.ceil(members.filter(m => !isReal(m.fatherId) && !isReal(m.motherId) && !isReal(m.parentId)).length / 2)} Roots</div>
          <div className="ft-stat-pill pink"><Heart size={13} fill="#ec4899" color="#ec4899" />{couples} Couples</div>
          <div className="ft-stat-pill gray"><GitBranch size={13} /> Drag to reposition • Connect handles for relationships</div>
        </div>
      )}

      {loading ? (
        <div className="ft-loading">
          <CircularProgress size={40} thickness={5} sx={{ color: '#0071e3' }} />
          <span>Loading family tree...</span>
        </div>
      ) : members.length === 0 ? (
        <div className="ft-empty">
          <div className="ft-empty-icon"><Users size={48} /></div>
          <div className="ft-empty-title">No Family Data Yet</div>
          <div className="ft-empty-sub">Begin building your family heritage tree</div>
          <button className="ft-empty-btn" onClick={() => setShowForm(true)}>
            <UserPlus size={16} /> Add First Member
          </button>
        </div>
      ) : (
        <div className="ft-flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
            defaultEdgeOptions={{ type: 'relationEdge' }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#e2e8f0" gap={24} size={1.5} variant="dots" />
            <Controls className="ft-flow-controls" />
            <MiniMap className="ft-minimap" nodeColor={n => getPaletteForRelation(n.data?.member?.relation)?.accent || '#94a3b8'} />

            <Panel position="top-right" className="ft-flow-panel">
              <button className="ft-panel-btn" onClick={resetLayout} title="Auto-layout">
                <RotateCcw size={14} /> Reset Layout
              </button>
            </Panel>
          </ReactFlow>
        </div>
      )}

      {/* FAB */}
      <motion.button className="ft-fab" whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.93 }}
        onClick={() => { setEditMember(null); setShowForm(true); }}>
        <UserPlus size={22} />
      </motion.button>

      <MemberDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditMember(null); }}
        members={members}
        onSave={handleSave}
        editMember={editMember}
      />
    </div>
  );
}

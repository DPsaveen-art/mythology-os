import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ForceGraph2D from 'react-force-graph-2d'
import { getRelationshipsForEntities } from '../services/relationships'
import { mythoDb } from '../services/db'
import type { ContentEntity, EntityType, Relationship } from '../types'

const MAX_NODES = 50
const ENTITY_TYPE_COLORS: Record<string, string> = {
  being: '#c9a227',
  story: '#8b7355',
  place: '#5a7a6b',
  motif: '#9a7b9e',
  group: '#6b8c9a',
  object: '#a67c52',
}
const DEFAULT_NODE_COLOR = '#6b6560'

interface GraphNode {
  id: string
  entityType: EntityType
  name: string
  isCenter: boolean
}

interface GraphLink {
  source: string
  target: string
  relationType: string
}

const CONTENT_TYPES: EntityType[] = ['being', 'story', 'place', 'motif', 'group', 'object']

interface RelationMapProps {
  entity: ContentEntity
  relationships: Relationship[]
  includeSecondDegree: boolean
  filterTypes: EntityType[]
  onIncludeSecondDegreeChange?: (v: boolean) => void
  onFilterTypesChange?: (v: EntityType[]) => void
}

async function buildGraphData(
  entity: ContentEntity,
  rels: Relationship[],
  includeSecondDegree: boolean,
  filterTypes: EntityType[]
): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
  const nodeMap = new Map<string, GraphNode>()
  const linkSet = new Set<string>()
  const links: GraphLink[] = []

  const stores: Record<string, { getById: (id: string) => Promise<{ name: string } | undefined> }> = {
    being: mythoDb.beings,
    story: mythoDb.stories,
    place: mythoDb.places,
    motif: mythoDb.motifs,
    group: mythoDb.groups,
    object: mythoDb.objects,
  }

  const resolveEntity = async (type: EntityType, id: string): Promise<string> => {
    const store = stores[type as keyof typeof stores]
    if (!store) return id
    const e = await store.getById(id)
    return e?.name ?? id
  }

  const addNode = (id: string, type: EntityType, name: string, isCenter: boolean) => {
    if (filterTypes.length > 0 && !filterTypes.includes(type)) return
    if (nodeMap.size >= MAX_NODES && !nodeMap.has(id)) return
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, entityType: type, name, isCenter })
    }
  }

  const addLink = (source: string, target: string, relationType: string) => {
    const key = [source, target].sort().join('|')
    if (!linkSet.has(key)) {
      linkSet.add(key)
      links.push({ source, target, relationType })
    }
  }

  addNode(entity.id, entity.entityType, entity.name, true)

  for (const r of rels) {
    const isFrom = r.fromEntityId === entity.id
    const targetId = isFrom ? r.toEntityId : r.fromEntityId
    const targetType = isFrom ? r.toEntityType : r.fromEntityType
    addNode(targetId, targetType, '', false)
    addLink(entity.id, targetId, r.relationType)
  }

  if (includeSecondDegree && nodeMap.size < MAX_NODES) {
    const neighborKeys = Array.from(nodeMap.values())
      .filter((n) => !n.isCenter)
      .map((n) => ({ type: n.entityType, id: n.id }))
    const secondRels = await getRelationshipsForEntities(neighborKeys)
    for (const r of secondRels) {
      const fromId = r.fromEntityId
      const toId = r.toEntityId
      const fromType = r.fromEntityType
      const toType = r.toEntityType
      if (fromId === toId) continue
      if (!nodeMap.has(fromId) && nodeMap.size < MAX_NODES) {
        const name = await resolveEntity(fromType, fromId)
        addNode(fromId, fromType, name, false)
      }
      if (!nodeMap.has(toId) && nodeMap.size < MAX_NODES) {
        const name = await resolveEntity(toType, toId)
        addNode(toId, toType, name, false)
      }
      if (nodeMap.has(fromId) && nodeMap.has(toId)) {
        addLink(fromId, toId, r.relationType)
      }
    }
  }

  for (const n of nodeMap.values()) {
    if (!n.name) {
      n.name = await resolveEntity(n.entityType, n.id)
    }
  }

  return { nodes: Array.from(nodeMap.values()), links }
}

export function RelationMap({
  entity,
  relationships,
  includeSecondDegree,
  filterTypes,
  onIncludeSecondDegreeChange,
  onFilterTypesChange,
}: RelationMapProps) {
  const navigate = useNavigate()
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  })

  useEffect(() => {
    let cancelled = false
    buildGraphData(entity, relationships, includeSecondDegree, filterTypes).then((data) => {
      if (!cancelled) setGraphData(data)
    })
    return () => {
      cancelled = true
    }
  }, [entity.id, entity.entityType, entity.name, relationships, includeSecondDegree, filterTypes])

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      navigate(`/entities/${node.entityType}/${node.id}`)
    },
    [navigate]
  )

  const nodeColor = useCallback((node: GraphNode) => {
    return node.isCenter ? '#c9a227' : ENTITY_TYPE_COLORS[node.entityType] ?? DEFAULT_NODE_COLOR
  }, [])

  const nodeVal = useCallback((node: GraphNode) => (node.isCenter ? 12 : 6), [])

  const nodeLabel = useCallback((node: GraphNode) => `${node.name} (${node.entityType})`, [])

  const toggleFilter = (t: EntityType) => {
    if (!onFilterTypesChange) return
    const showAll = filterTypes.length === 0
    const currentlyIncluded = showAll || filterTypes.includes(t)
    const next = currentlyIncluded
      ? (showAll ? CONTENT_TYPES : filterTypes).filter((x) => x !== t)
      : [...filterTypes, t]
    onFilterTypesChange(next.length === CONTENT_TYPES.length ? [] : next)
  }

  if (relationships.length === 0) {
    return (
      <div className="relation-map-panel">
        <div className="relation-map-empty">
          No relationships to map. Add connections in Web of Relations.
        </div>
      </div>
    )
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="relation-map-panel">
        <div className="relation-map-empty">Building map…</div>
      </div>
    )
  }

  return (
    <div className="relation-map-panel">
      <div className="relation-map-controls">
        {onIncludeSecondDegreeChange && (
          <label>
            <input
              type="checkbox"
              checked={includeSecondDegree}
              onChange={(e) => onIncludeSecondDegreeChange(e.target.checked)}
            />
            Include second-degree connections
          </label>
        )}
        {onFilterTypesChange && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CONTENT_TYPES.map((t) => (
              <label key={t}>
                <input
                  type="checkbox"
                  checked={filterTypes.length === 0 || filterTypes.includes(t)}
                  onChange={() => toggleFilter(t)}
                />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="relation-map-container">
        <ForceGraph2D
          graphData={graphData}
          nodeId="id"
          nodeLabel={nodeLabel}
          nodeColor={nodeColor}
          nodeVal={nodeVal}
          linkColor={() => 'rgba(201, 162, 39, 0.35)'}
          linkWidth={1}
          onNodeClick={handleNodeClick}
          backgroundColor="transparent"
          width={undefined}
          height={320}
        />
      </div>
    </div>
  )
}

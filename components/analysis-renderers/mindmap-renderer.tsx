"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface MindMapNode {
  name: string
  children?: MindMapNode[]
}

interface MindMapRendererProps {
  content: string
}

export function MindMapRenderer({ content }: MindMapRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !content) return

    // Parse le contenu texte en structure hiérarchique
    const rootNode = parseMarkdownToHierarchy(content)
    renderMindMap(rootNode)
  }, [content])

  const parseMarkdownToHierarchy = (markdown: string): MindMapNode => {
    const lines = markdown.split("\n").filter((line) => line.trim() !== "")
    const root: MindMapNode = { name: "Concept Principal", children: [] }
    let currentL1: MindMapNode | null = null
    let currentL2: MindMapNode | null = null

    lines.forEach((line) => {
      if (line.startsWith("# ")) {
        // Titre principal
        root.name = line.substring(2).trim()
      } else if (line.startsWith("## ")) {
        // Sous-concept niveau 1
        currentL1 = { name: line.substring(3).trim(), children: [] }
        root.children = root.children || []
        root.children.push(currentL1)
        currentL2 = null
      } else if (line.startsWith("### ")) {
        // Sous-concept niveau 2
        if (currentL1) {
          currentL2 = { name: line.substring(4).trim(), children: [] }
          currentL1.children = currentL1.children || []
          currentL1.children.push(currentL2)
        }
      } else if (line.startsWith("- ")) {
        // Point de détail
        const detail = { name: line.substring(2).trim() }
        if (currentL2) {
          currentL2.children = currentL2.children || []
          currentL2.children.push(detail)
        } else if (currentL1) {
          currentL1.children = currentL1.children || []
          currentL1.children.push(detail)
        }
      }
    })

    return root
  }

  const renderMindMap = (data: MindMapNode) => {
    if (!svgRef.current) return

    // Nettoyer le SVG
    d3.select(svgRef.current).selectAll("*").remove()

    const width = 800
    const height = 600
    const margin = { top: 20, right: 120, bottom: 20, left: 120 }

    // Créer la hiérarchie D3
    const root = d3.hierarchy(data)

    // Calculer les positions
    const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.right - margin.left])
    treeLayout(root)

    // Créer le SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Ajouter les liens
    svg
      .selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x),
      )
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5)

    // Ajouter les nœuds
    const node = svg
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)

    // Ajouter les cercles pour les nœuds
    node
      .append("circle")
      .attr("r", 5)
      .attr("fill", (d: any) =>
        d.depth === 0 ? "#ff7043" : d.depth === 1 ? "#42a5f5" : d.depth === 2 ? "#66bb6a" : "#9575cd",
      )

    // Ajouter les textes
    node
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => (d.children ? -8 : 8))
      .attr("text-anchor", (d: any) => (d.children ? "end" : "start"))
      .text((d: any) => d.data.name)
      .attr("font-size", (d: any) => (d.depth === 0 ? "14px" : d.depth === 1 ? "12px" : "10px"))
      .attr("fill", "#333")
  }

  return (
    <div className="mindmap-container overflow-auto bg-white dark:bg-gray-800 rounded-lg p-4">
      <svg ref={svgRef} className="w-full h-[600px]"></svg>
    </div>
  )
}

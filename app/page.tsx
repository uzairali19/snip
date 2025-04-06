"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import * as monaco from "monaco-editor";
import {
  Box,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Typography,
  Tooltip,
  Button,
} from "@mui/material";
import { ChevronRight, Close } from "@mui/icons-material";
import dynamic from "next/dynamic";
import FileExplorer from "@/components/FileExplorer";
import NewItemDialog from "@/components/NewItemDialog";
import { FileNode } from "@/types/file";
import { v4 as uuid } from "uuid";
import { DragEndEvent } from "@dnd-kit/core";
import { debounce } from "lodash";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const STORAGE_KEY = "editorLayout";

const findFileById = (tree: FileNode[], id: string): FileNode | null => {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.type === "folder" && node.children) {
      const found = findFileById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const saveTreeToBackend = async (tree: FileNode[]) => {
  try {
    await fetch("/api/snippets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tree),
    });
  } catch (err) {
    console.error("[✘] Failed to save updated tree:", err);
  }
};

export default function HomePage() {
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"file" | "folder">("file");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const editorRef = useRef<any>(null);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const saveLayout = (width: number, open: boolean) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ width, open }));
  };

  const dragStartX = useRef(0);
  const startWidth = useRef(300);

  const debouncedSave = useRef(
    debounce((tree: FileNode[]) => {
      saveTreeToBackend(tree);
    }, 800)
  ).current;

  useEffect(() => {
    const loadSnippetsFromBackend = async () => {
      try {
        const res = await fetch("/api/snippets");
        const snippets = await res.json();
        setFileTree(snippets);
      } catch (err) {
        console.error("[✘] Failed to load snippets:", err);
      }
    };
    loadSnippetsFromBackend();
  }, []);

  const handleAddItem = async (name: string) => {
    const newItem: FileNode = {
      id: uuid(),
      name,
      type: dialogType,
      ...(dialogType === "folder" ? { children: [] } : { content: "" }),
    };

    const insertInto = (tree: FileNode[]): FileNode[] =>
      tree.map((node) => {
        if (node.type === "folder" && node.id === selectedFolderId) {
          return { ...node, children: [...(node.children || []), newItem] };
        }
        if (node.children) {
          return { ...node, children: insertInto(node.children) };
        }
        return node;
      });

    const updatedTree = selectedFolderId
      ? insertInto([...fileTree])
      : [...fileTree, newItem];

    setFileTree(updatedTree);
    saveTreeToBackend(updatedTree);

    if (newItem.type === "file") {
      setOpenTabs((prev) => [...prev, newItem.id]);
      setActiveFileId(newItem.id);
    } else {
      setSelectedFolderId(newItem.id);
    }
  };

  const handleFileSelect = (id: string) => {
    const fresh = findFileById(fileTree, id);
    if (!fresh) return;

    if (fresh.type === "folder") {
      setSelectedFolderId(fresh.id);
      return;
    }

    setSelectedFolderId(null);

    if (!openTabs.includes(fresh.id)) {
      setOpenTabs((prev) => [...prev, fresh.id]);
    }

    setActiveFileId(fresh.id);
  };

  const handleCloseTab = (id: string) => {
    setOpenTabs((prev) => prev.filter((tabId) => tabId !== id));
    if (activeFileId === id) {
      const remaining = openTabs.filter((tabId) => tabId !== id);
      setActiveFileId(remaining[0] || null);
    }
  };

  const handleEditorChange = (value?: string) => {
    if (!activeFileId) return;

    setFileTree((prevTree) => {
      const updateContent = (nodes: FileNode[]): FileNode[] =>
        nodes.map((node) => {
          if (node.id === activeFileId && node.type === "file") {
            return { ...node, content: value || "" };
          }
          if (node.children) {
            return { ...node, children: updateContent(node.children) };
          }
          return node;
        });

      const updatedTree = updateContent(prevTree);
      debouncedSave(updatedTree);
      return updatedTree;
    });
  };

  const moveNode = (
    tree: FileNode[],
    sourceId: string,
    targetId: string | null
  ): FileNode[] => {
    let dragged: FileNode | null = null;

    const remove = (nodes: FileNode[]): FileNode[] =>
      nodes
        .map((node) => {
          if (node.id === sourceId) {
            dragged = node;
            return null;
          }
          if (node.children) {
            node.children = remove(node.children).filter(Boolean) as FileNode[];
          }
          return node;
        })
        .filter(Boolean) as FileNode[];

    const insert = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => {
        if (node.id === targetId && node.type === "folder") {
          return {
            ...node,
            children: [...(node.children || []), dragged!],
          };
        }
        if (node.children) {
          return { ...node, children: insert(node.children) };
        }
        return node;
      });

    let updated = remove([...tree]);
    updated = targetId ? insert(updated) : [...updated, dragged!];
    return updated;
  };

  const handleUpdateTree = (updated: FileNode[]) => {
    setFileTree(updated);
    saveTreeToBackend(updated);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.min(
        Math.max(startWidth.current + delta, 150),
        1000
      );
      setSidebarWidth(newWidth);
      saveLayout(newWidth, isSidebarOpen);
    },
    [isDragging, isSidebarOpen]
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { width, open } = JSON.parse(saved);
        if (width) setSidebarWidth(width);
        if (typeof open === "boolean") setIsSidebarOpen(open);
      } catch {}
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", () => setIsDragging(false));
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", () => setIsDragging(false));
    };
  }, [handleMouseMove]);

  const activeFile = activeFileId ? findFileById(fileTree, activeFileId) : null;

  const handleRunCode = () => {
    if (!activeFile || !activeFile.content) return;

    setOutputLogs([]);
    if (editorRef.current) {
      monaco.editor.setModelMarkers(editorRef.current.getModel(), "owner", []);
    }

    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map((arg) => String(arg)).join(" "));
      },
    };

    try {
      const fn = new Function(
        "console",
        `
        try {
          ${activeFile.content}
        } catch (err) {
          console.log("Error: " + err.message);
          if (err.stack) {
            const match = err.stack.match(/<anonymous>:(\\d+):(\\d+)/);
            if (match) {
              console.log("At line " + (parseInt(match[1])));
            }
          }
        }
      `
      );

      fn(customConsole);
      setOutputLogs(logs);
    } catch (err: any) {
      const errorMessage = `Syntax Error: ${err.message}`;
      logs.push(errorMessage);

      if (err.stack) {
        const match = err.stack.match(/<anonymous>:(\d+):(\d+)/);
        if (match) {
          const lineNumber = parseInt(match[1]);
          logs.push("At line " + lineNumber);

          if (editorRef.current) {
            monaco.editor.setModelMarkers(
              editorRef.current.getModel(),
              "owner",
              [
                {
                  startLineNumber: lineNumber,
                  startColumn: 1,
                  endLineNumber: lineNumber,
                  endColumn: 1,
                  message: err.message,
                  severity: monaco.MarkerSeverity.Error,
                },
              ]
            );
          }
        }
      }

      setOutputLogs(logs);
    }
  };

  return (
    <Box display="flex" height="100vh" width="100vw" overflow="hidden">
      {isSidebarOpen && (
        <Box
          sx={{
            width: sidebarWidth,
            backgroundColor: "#1e1e1e",
            color: "#fff",
            overflowY: "auto",
          }}
        >
          <FileExplorer
            tree={fileTree}
            onFileSelect={handleFileSelect}
            onAddFile={() => {
              setDialogType("file");
              setDialogOpen(true);
            }}
            onAddFolder={() => {
              setDialogType("folder");
              setDialogOpen(true);
            }}
            onUpdateTree={handleUpdateTree}
            selectedFolderId={selectedFolderId}
            showToast={() => {}}
          />
        </Box>
      )}

      {isSidebarOpen && (
        <Divider
          onMouseDown={(e) => {
            dragStartX.current = e.clientX;
            startWidth.current = sidebarWidth;
            setIsDragging(true);
          }}
          sx={{
            width: "5px",
            cursor: "col-resize",
            backgroundColor: "transparent",
            "&:hover": { backgroundColor: "#ccc" },
          }}
        />
      )}

      <Box flexGrow={1} display="flex" flexDirection="column">
        {!isSidebarOpen && (
          <Box
            sx={{
              height: "40px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              pl: 1,
            }}
          >
            <IconButton onClick={() => setIsSidebarOpen(true)}>
              <ChevronRight />
            </IconButton>
          </Box>
        )}

        {openTabs.length > 0 && (
          <Box
            sx={{
              backgroundColor: "#1e1e1e",
              color: "#fff",
              borderBottom: "1px solid #333",
            }}
          >
            <Tabs
              value={activeFileId}
              onChange={(_, id) => setActiveFileId(id)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {openTabs.map((tabId) => {
                const file = findFileById(fileTree, tabId);
                if (!file) return null;

                const isActive = activeFileId === file.id;
                return (
                  <Tab
                    key={file.id}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          fontSize={13}
                          sx={{
                            color: isActive ? "#1976d2" : "#fff",
                          }}
                        >
                          {file.name}
                        </Typography>
                        <Tooltip title="Close">
                          <Close
                            fontSize="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseTab(file.id);
                            }}
                          />
                        </Tooltip>
                      </Box>
                    }
                    value={file.id}
                    sx={{
                      minHeight: 32,
                      textTransform: "none",
                      fontSize: 13,
                      color: isActive ? "#1976d2" : "#fff",
                    }}
                  />
                );
              })}
            </Tabs>
            <Box
              sx={{
                backgroundColor: "#1e1e1e",
                padding: "4px 8px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                color="success"
                size="small"
                onClick={handleRunCode}
              >
                ▶ Run
              </Button>
            </Box>
          </Box>
        )}

        <Box flexGrow={1}>
          {activeFile ? (
            <MonacoEditor
              key={activeFileId}
              height="100%"
              language="javascript"
              value={activeFile.content}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme="vs-dark"
            />
          ) : (
            <Box
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{ color: "#aaa", fontSize: 18, fontStyle: "italic" }}
            >
              No file selected
            </Box>
          )}
        </Box>

        <Box
          sx={{
            backgroundColor: "#111",
            color: "#0f0",
            fontFamily: "monospace",
            fontSize: 13,
            px: 2,
            py: 1,
            minHeight: "100px",
            borderTop: "1px solid #333",
          }}
        >
          {outputLogs.length > 0 ? (
            outputLogs.map((line, idx) => (
              <Typography key={idx}>{line}</Typography>
            ))
          ) : (
            <Typography sx={{ fontStyle: "italic", color: "#666" }}>
              Output will appear here...
            </Typography>
          )}
        </Box>
      </Box>

      <NewItemDialog
        open={dialogOpen}
        type={dialogType}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddItem}
      />
    </Box>
  );
}

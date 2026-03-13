import { Extension } from "@tiptap/core";
import { EditorState, Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import axios from "axios";
import { toast } from "sonner";

const DEFAULT_IMAGE_STYLES = {};

const axonUploadImage = new PluginKey("axonUploadImage");

interface ImageNodeAttrs {
	src: string;
	alt?: string | null;
	class?: string | null;
}

const ImageNode = {
	group: "inline" as const,
	inline: true,
	draggable: true,
	attrs: {
		src: {} as { default?: string }, // required attribute
		alt: { default: null } as { default: string | null },
		class: { default: null } as { default: string | null }, // optional class attribute
	},
	parseDOM: [
		{
			tag: "img[src]",
			getAttrs: (dom: HTMLElement): ImageNodeAttrs => ({
				src: dom.getAttribute("src") || "",
				alt: dom.getAttribute("alt"),
				class: dom.getAttribute("class"),
			}),
		},
	],
	toDOM: (node: { attrs: ImageNodeAttrs }): [string, ImageNodeAttrs] => [
		"img",
		node.attrs,
	],
};

interface ImageStyles {
	width?: string;
	height?: string;
	class?: string;
}

export interface AxonImageUploadOptions {
	styles?: ImageStyles;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		axonImage: {
			insertAxonImage: (file: File, styles?: ImageStyles) => ReturnType;
		};
	}
}

export const AxonImageExtension = Extension.create<AxonImageUploadOptions>({
	name: "axonImage",

	addOptions() {
		return {
			styles: DEFAULT_IMAGE_STYLES,
		};
	},

	addNodeView() {
		return {
			image: ImageNode,
		};
	},

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: axonUploadImage,
				state: {
					init() {
						return DecorationSet.empty;
					},
					apply(tr, set) {
						set = set.map(tr.mapping, tr.doc);
						const action = tr.getMeta(axonUploadImage);

						if (action?.add) {
							const { id, pos, content, styles } = action.add;

							// Create a wrapper div for the placeholder
							const wrapper = document.createElement("div");

							// Create the image element with the same styles that will be applied to the final image
							const image = document.createElement("img");
							image.className = `${styles.class} m-0 animate-pulse bg-gray-200`;
							image.setAttribute("style", "width:300px; height: auto;");
							image.alt = "Uploading...";

							image.src = URL.createObjectURL(content);

							wrapper.appendChild(image);

							// Create the decoration with the wrapper
							const deco = Decoration.widget(pos, wrapper, { id });
							set = set.add(tr.doc, [deco]);
						} else if (action?.remove) {
							set = set.remove(
								set.find(
									undefined,
									undefined,
									// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
									(spec) => spec.id == action.remove.id,
								),
							);
						}
						return set;
					},
				},
				props: {
					decorations(state) {
						return this.getState(state);
					},
				},
			}),
		];
	},

	addCommands() {
		return {
			insertAxonImage:
				(file: File, customStyles: ImageStyles = {}) =>
				({ tr, dispatch, view }) => {
					if (dispatch && view) {
						const id = {};
						const pos = tr.selection.from;
						const styles = { ...DEFAULT_IMAGE_STYLES, ...customStyles };

						tr.setMeta(axonUploadImage, {
							add: { id, pos: pos + 1, content: file, styles },
						});

						dispatch(tr);

						// Simulate upload delay
						onUpload(file)
							.then((url) => {
								const { state } = view;
								const newTr = state.tr;
								const pos = findPlaceholder(state, id);

								if (pos === null) return;

								const node = state.schema.nodes.image?.create({
									src: url,
									alt: file.name,
									class: "w-[300px] h-auto rounded-md",
								});

								if (!node) return;

								newTr.replaceWith(pos, pos, node).setMeta(axonUploadImage, {
									remove: { id },
								});

							view.dispatch(newTr);
						})
							.catch(() => {
								return false;
							});

						return true;
					}
					return false;
				},
		};
	},
});

function findPlaceholder(state: EditorState, id: object) {
	const decos = axonUploadImage.getState(state) as DecorationSet;
	// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
	const found = decos.find(undefined, undefined, (spec) => spec.id == id);
	return found.length ? found[0]?.from : null;
}

export const onUpload = (file: File): Promise<string> => {
	const formData = new FormData();
	const path = window.location.pathname;
	const match = path.match(/\/workspace\/(main|axonverse)\/([^\/]+)/);
	if (!match) return new Promise((resolve, reject) => reject("error"));

	formData.append("image", file);
	formData.append("workspaceId", match[2]);
	const promise = axios.post(
		`${process.env.NEXT_PUBLIC_API_URL}/api/workspace/image/embed`,
		formData,
		{
			withCredentials: true,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);

	return new Promise((resolve) => {
		toast.promise(
			promise.then(async (res) => {
				if (res.status === 201) {
					const { data } = res.data;
					const image = new Image();
					image.src = data;
					image.onload = () => {
						resolve(data);
					};
				} else if (res.status === 401) {
					throw new Error(
						"`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead.",
					);
				} else {
					throw new Error("Error uploading image. Please try again.");
				}
			}),
			{
				className: "bg-neutral-900 text-white",
				loading: "Uploading image...",
				success: "Image uploaded successfully.",
				error: (e) => e.message,
			},
		);
	});
};

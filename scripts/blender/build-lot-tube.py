import math
import os

import bpy


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "public", "models", "lot-tube")
BLEND_PATH = os.path.join(PROJECT_ROOT, "scripts", "blender", "lot-tube.blend")
TEXTURE_SIZE = 1024
ROUGHNESS_SIZE = 512


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def clean_output_dir():
    for filename in os.listdir(OUTPUT_DIR):
        os.remove(os.path.join(OUTPUT_DIR, filename))


def configure_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 1
    scene.cycles.use_denoising = False
    scene.render.image_settings.file_format = "PNG"
    scene.view_settings.view_transform = "Standard"


def make_object(name, mesh, location=(0, 0, 0), material=None):
    obj = bpy.data.objects.new(name, mesh)
    obj.location = location
    bpy.context.collection.objects.link(obj)
    return obj


def add_cylinder(name, radius, depth, material, vertices=64, cap=True):
    mesh = bpy.data.meshes.new(name)
    obj = make_object(name, mesh, material=material)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)

    with bpy.context.temp_override(active_object=obj, selected_editable_objects=[obj]):
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=vertices,
            radius=radius,
            depth=depth,
            end_fill_type="NGON" if cap else "NOTHING",
        )

    created = bpy.context.active_object
    if created != obj:
        bpy.data.objects.remove(obj)
    created.name = name
    created.data.name = f"{name}Mesh"
    created.data.materials.append(material)
    return created


def add_rim(name, radius, material):
    mesh = bpy.data.meshes.new(name)
    obj = make_object(name, mesh, material=material)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)

    with bpy.context.temp_override(active_object=obj, selected_editable_objects=[obj]):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=radius,
            minor_radius=0.028,
            major_segments=96,
            minor_segments=16,
        )

    created = bpy.context.active_object
    if created != obj:
        bpy.data.objects.remove(obj)
    created.name = name
    created.data.name = f"{name}Mesh"
    created.data.materials.append(material)
    return created


def add_seal(name, material):
    mesh = bpy.data.meshes.new(name)
    obj = make_object(name, mesh, material=material)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)

    with bpy.context.temp_override(active_object=obj, selected_editable_objects=[obj]):
        bpy.ops.mesh.primitive_plane_add(size=0.24)

    created = bpy.context.active_object
    if created != obj:
        bpy.data.objects.remove(obj)
    created.name = name
    created.data.name = f"{name}Mesh"
    created.data.materials.append(material)
    return created


def unwrap_object(obj):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
    bpy.ops.object.mode_set(mode="OBJECT")


def make_procedural_material(name, base_color, accent_color, roughness):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    texcoord = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    links.new(texcoord.outputs["UV"], mapping.inputs["Vector"])

    grain = nodes.new("ShaderNodeTexNoise")
    grain.inputs["Scale"].default_value = 22.0
    grain.inputs["Detail"].default_value = 8.0
    grain.inputs["Roughness"].default_value = 0.68
    links.new(mapping.outputs["Vector"], grain.inputs["Vector"])

    streaks = nodes.new("ShaderNodeTexWave")
    streaks.bands_direction = "Y"
    streaks.wave_profile = "SIN"
    streaks.inputs["Scale"].default_value = 3.5
    streaks.inputs["Distortion"].default_value = 8.0
    streaks.inputs["Detail"].default_value = 5.0
    links.new(mapping.outputs["Vector"], streaks.inputs["Vector"])

    color_ramp = nodes.new("ShaderNodeValToRGB")
    color_ramp.color_ramp.elements[0].color = base_color
    color_ramp.color_ramp.elements[1].color = accent_color
    links.new(streaks.outputs["Color"], color_ramp.inputs["Fac"])

    rough_ramp = nodes.new("ShaderNodeValToRGB")
    rough_ramp.color_ramp.elements[0].position = 0.32
    rough_ramp.color_ramp.elements[0].color = (roughness + 0.10, roughness + 0.08, roughness + 0.06, 1)
    rough_ramp.color_ramp.elements[1].position = 0.78
    rough_ramp.color_ramp.elements[1].color = (max(0.2, roughness - 0.08),) * 3 + (1,)
    links.new(grain.outputs["Fac"], rough_ramp.inputs["Fac"])

    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.18
    bump.inputs["Distance"].default_value = 0.004
    links.new(grain.outputs["Fac"], bump.inputs["Height"])

    links.new(color_ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(rough_ramp.outputs["Color"], bsdf.inputs["Roughness"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

    material["accentColor"] = accent_color[:3]
    material["baseColor"] = base_color[:3]
    return material


def bake_map(obj, name, bake_type, size, color_space):
    image = bpy.data.images.new(name, size, size, alpha=False)
    image.colorspace_settings.name = color_space
    material = obj.active_material
    node = obj.active_material.node_tree.nodes.new("ShaderNodeTexImage")
    node.image = image
    node.select = True
    obj.active_material.node_tree.nodes.active = node

    if bake_type == "DIFFUSE":
        nodes = material.node_tree.nodes
        links = material.node_tree.links
        output = next(item for item in nodes if item.type == "OUTPUT_MATERIAL")
        color_source = next(item for item in nodes if item.type == "VALTORGB")
        bsdf = next(item for item in nodes if item.type == "BSDF_PRINCIPLED")
        emission = nodes.new("ShaderNodeEmission")
        links.new(color_source.outputs["Color"], emission.inputs["Color"])
        links.new(emission.outputs["Emission"], output.inputs["Surface"])

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.bake(
        type="EMIT" if bake_type == "DIFFUSE" else bake_type,
        pass_filter=set(),
        margin=6,
        margin_type="ADJACENT_FACES",
        use_clear=True,
        use_selected_to_active=False,
    )
    if bake_type == "DIFFUSE":
        links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
        nodes.remove(emission)

    image.pack()
    return image


def finish_material(obj, image_prefix):
    material = obj.active_material
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = next(node for node in nodes if node.type == "BSDF_PRINCIPLED")
    output = next(node for node in nodes if node.type == "OUTPUT_MATERIAL")

    albedo_image = bpy.data.images[f"{image_prefix}Albedo"]
    roughness_image = bpy.data.images[f"{image_prefix}Roughness"]
    normal_image = bpy.data.images[f"{image_prefix}Normal"]
    albedo_image.colorspace_settings.name = "sRGB"
    roughness_image.colorspace_settings.name = "Non-Color"
    normal_image.colorspace_settings.name = "Non-Color"

    albedo = nodes.new("ShaderNodeTexImage")
    albedo.image = albedo_image
    roughness = nodes.new("ShaderNodeTexImage")
    roughness.image = roughness_image
    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_image_node = nodes.new("ShaderNodeTexImage")
    normal_image_node.image = normal_image
    links.new(albedo.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(roughness.outputs["Color"], bsdf.inputs["Roughness"])
    links.new(normal_image_node.outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])


def build_models():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    tube_material = make_procedural_material(
        "LotTube_Baked",
        (0.128, 0.072, 0.038, 1),
        (0.790, 0.635, 0.270, 1),
        0.42,
    )
    stick_material = make_procedural_material(
        "LotStick_Baked",
        (0.780, 0.652, 0.442, 1),
        (0.430, 0.288, 0.130, 1),
        0.55,
    )
    seal_material = make_procedural_material(
        "LotSeal_Baked",
        (0.575, 0.118, 0.092, 1),
        (0.910, 0.780, 0.420, 1),
        0.34,
    )

    body = add_cylinder("TubeBody", 0.54, 1.58, tube_material, cap=False)
    body.location = (0, 0, 0.79)
    base = add_cylinder("TubeBase", 0.54, 0.07, tube_material, cap=True)
    base.location = (0, 0, 0.035)
    rim = add_rim("TubeRim", 0.53, tube_material)
    rim.location = (0, 0, 1.60)
    seal = add_seal("LotSeal", seal_material)
    seal.rotation_euler = (math.radians(90), 0, 0)
    seal.location = (0, -0.535, 0.78)

    tube_group = bpy.data.objects.new("LotTube", None)
    bpy.context.collection.objects.link(tube_group)
    for child in (body, base, rim, seal):
        child.parent = tube_group

    stick = add_cylinder("LotStick", 0.042, 1.72, stick_material, vertices=18)
    stick.name = "LotStick"

    for obj in (body, base, rim, seal, stick):
        unwrap_object(obj)

    configure_render()
    bake_map(body, "LotTubeAlbedo", "DIFFUSE", TEXTURE_SIZE, "sRGB")
    bake_map(body, "LotTubeRoughness", "ROUGHNESS", ROUGHNESS_SIZE, "Non-Color")
    bake_map(body, "LotTubeNormal", "NORMAL", ROUGHNESS_SIZE, "Non-Color")
    bake_map(stick, "LotStickAlbedo", "DIFFUSE", TEXTURE_SIZE, "sRGB")
    bake_map(stick, "LotStickRoughness", "ROUGHNESS", ROUGHNESS_SIZE, "Non-Color")
    bake_map(stick, "LotStickNormal", "NORMAL", ROUGHNESS_SIZE, "Non-Color")
    bake_map(seal, "LotSealAlbedo", "DIFFUSE", TEXTURE_SIZE, "sRGB")
    bake_map(seal, "LotSealRoughness", "ROUGHNESS", ROUGHNESS_SIZE, "Non-Color")
    bake_map(seal, "LotSealNormal", "NORMAL", ROUGHNESS_SIZE, "Non-Color")

    finish_material(body, "LotTube")
    finish_material(base, "LotTube")
    finish_material(rim, "LotTube")
    finish_material(stick, "LotStick")
    finish_material(seal, "LotSeal")

    bpy.ops.object.select_all(action="DESELECT")
    tube_group.select_set(True)
    for child in tube_group.children:
        child.select_set(True)
    stick.select_set(True)
    bpy.context.view_layer.objects.active = tube_group
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(OUTPUT_DIR, "lot-tube.gltf"),
        export_format="GLTF_SEPARATE",
        use_selection=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_yup=True,
    )
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)


if __name__ == "__main__":
    clear_scene()
    clean_output_dir()
    build_models()

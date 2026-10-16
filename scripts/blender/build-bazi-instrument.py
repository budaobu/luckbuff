import math
import os

import bpy


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUTPUT_DIR = os.path.join(
    PROJECT_ROOT,
    "public",
    "assets",
    "bazi-paipan-3d",
    "instrument-source",
)
BLEND_PATH = os.path.join(PROJECT_ROOT, "scripts", "blender", "bazi-instrument.blend")
RING_RADII = (2.30, 1.80, 1.30, 0.85)
TEXTURE_SIZE = 1024


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def clean_output():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for name in os.listdir(OUTPUT_DIR):
        os.remove(os.path.join(OUTPUT_DIR, name))


def configure_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 8
    scene.cycles.use_denoising = False
    scene.render.image_settings.file_format = "PNG"
    scene.view_settings.view_transform = "Standard"


def active_operator_target(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def create_primitive(name, material, operator):
    placeholder = bpy.data.objects.new(name, bpy.data.meshes.new(f"{name}_empty"))
    bpy.context.collection.objects.link(placeholder)
    active_operator_target(placeholder)
    operator()
    created = bpy.context.active_object
    if created != placeholder:
        bpy.data.objects.remove(placeholder)
    created.name = name
    created.data.name = f"{name}Mesh"
    created.data.materials.append(material)
    return created


def add_torus(name, material, radius, minor_radius=0.026, major_segments=72, minor_segments=10):
    return create_primitive(
        name,
        material,
        lambda: bpy.ops.mesh.primitive_torus_add(
            major_radius=radius,
            minor_radius=minor_radius,
            major_segments=major_segments,
            minor_segments=minor_segments,
        ),
    )


def add_cube(name, material, size):
    return create_primitive(
        name,
        material,
        lambda: bpy.ops.mesh.primitive_cube_add(size=size),
    )


def add_cylinder(name, material, radius, depth, vertices=64):
    return create_primitive(
        name,
        material,
        lambda: bpy.ops.mesh.primitive_cylinder_add(
            vertices=vertices,
            radius=radius,
            depth=depth,
        ),
    )


def join_into_target(target, parts):
    active_operator_target(target)
    for part in parts:
        part.select_set(True)
    bpy.ops.object.join()
    target.name = target.name


def make_ring(name, radius, material):
    ring = add_torus(name, material, radius)
    ticks = []
    tick_count = 72
    for index in range(tick_count):
        angle = index / tick_count * math.tau
        major_tick = index % 6 == 0
        tick = add_cube(f"{name}_tick_tmp", material, 0.020)
        tick.scale = (1.0, 3.4 if major_tick else 1.8, 0.8)
        tick.rotation_euler = (0, 0, angle)
        tick.location = (math.cos(angle) * radius, math.sin(angle) * radius, 0)
        ticks.append(tick)
    join_into_target(ring, ticks)
    return ring


def procedural_material(name, base_color, accent_color, roughness, metallic):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Metallic"].default_value = metallic
    texcoord = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    links.new(texcoord.outputs["UV"], mapping.inputs["Vector"])
    grain = nodes.new("ShaderNodeTexNoise")
    grain.inputs["Scale"].default_value = 18.0
    grain.inputs["Detail"].default_value = 7.0
    links.new(mapping.outputs["Vector"], grain.inputs["Vector"])
    bands = nodes.new("ShaderNodeTexWave")
    bands.inputs["Scale"].default_value = 3.0
    bands.inputs["Distortion"].default_value = 5.0
    links.new(mapping.outputs["Vector"], bands.inputs["Vector"])
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = base_color
    ramp.color_ramp.elements[1].color = accent_color
    links.new(bands.outputs["Color"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(grain.outputs["Fac"], bsdf.inputs["Roughness"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return material


def unwrap(obj):
    active_operator_target(obj)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
    bpy.ops.object.mode_set(mode="OBJECT")


def set_bake_target(material, image):
    node = material.node_tree.nodes.new("ShaderNodeTexImage")
    node.image = image
    node.select = True
    material.node_tree.nodes.active = node
    return node


def bake_image(objects, material, name, bake_type, size, color_space):
    image = bpy.data.images.new(name, size, size, alpha=False)
    image.colorspace_settings.name = color_space
    set_bake_target(material, image)
    emission = None
    bsdf = None
    if bake_type == "EMIT":
        nodes = material.node_tree.nodes
        links = material.node_tree.links
        output = next(node for node in nodes if node.type == "OUTPUT_MATERIAL")
        color_source = next(node for node in nodes if node.type == "VALTORGB")
        bsdf = next(node for node in nodes if node.type == "BSDF_PRINCIPLED")
        emission = nodes.new("ShaderNodeEmission")
        links.new(color_source.outputs["Color"], emission.inputs["Color"])
        links.new(emission.outputs["Emission"], output.inputs["Surface"])
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.bake(
        type=bake_type,
        pass_filter=set(),
        margin=6,
        margin_type="ADJACENT_FACES",
        use_clear=True,
        use_selected_to_active=False,
    )
    if emission and bsdf:
        links = material.node_tree.links
        output = next(node for node in material.node_tree.nodes if node.type == "OUTPUT_MATERIAL")
        links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
        material.node_tree.nodes.remove(emission)
    image.pack()
    return image


def bake_material_maps(name, material, objects, texture_size, metallic):
    albedo = bake_image(
        objects,
        material,
        f"{name}Albedo",
        "EMIT",
        texture_size,
        "sRGB",
    )
    roughness = bake_image(
        objects,
        material,
        f"{name}Roughness",
        "ROUGHNESS",
        texture_size // 2,
        "Non-Color",
    )
    ao = bake_image(
        objects,
        material,
        f"{name}AO",
        "AO",
        texture_size // 2,
        "Non-Color",
    )
    normal = bake_image(
        objects,
        material,
        f"{name}Normal",
        "NORMAL",
        texture_size,
        "Non-Color",
    )

    orm = bpy.data.images.new(f"{name}ORM", texture_size // 2, texture_size // 2, alpha=False)
    orm.colorspace_settings.name = "Non-Color"
    source_images = (ao, roughness)
    pixel_count = orm.size[0] * orm.size[1]
    orm_pixels = [0.0] * (pixel_count * 4)
    for source in source_images:
        if source.size[0] != orm.size[0] or source.size[1] != orm.size[1]:
            source.scale(orm.size[0], orm.size[1])
    ao_pixels = source_images[0].pixels[:]
    rough_pixels = source_images[1].pixels[:]
    for index in range(pixel_count):
        orm_pixels[index * 4] = ao_pixels[index * 4]
        orm_pixels[index * 4 + 1] = rough_pixels[index * 4]
        orm_pixels[index * 4 + 2] = metallic
        orm_pixels[index * 4 + 3] = 1.0
    orm.pixels = orm_pixels
    orm.pack()

    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = next(node for node in nodes if node.type == "BSDF_PRINCIPLED")
    output = next(node for node in nodes if node.type == "OUTPUT_MATERIAL")
    albedo_node = nodes.new("ShaderNodeTexImage")
    albedo_node.image = albedo
    orm_node = nodes.new("ShaderNodeTexImage")
    orm_node.image = orm
    separate = nodes.new("ShaderNodeSeparateColor")
    normal_texture = nodes.new("ShaderNodeTexImage")
    normal_texture.image = normal
    normal_map = nodes.new("ShaderNodeNormalMap")
    links.new(albedo_node.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(orm_node.outputs["Color"], separate.inputs["Color"])
    links.new(separate.outputs["Green"], bsdf.inputs["Roughness"])
    links.new(separate.outputs["Blue"], bsdf.inputs["Metallic"])
    links.new(normal_texture.outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])


def build_instrument():
    reset_scene()
    clean_output()
    bronze = procedural_material(
        "InstrumentBronze",
        (0.082, 0.045, 0.024, 1),
        (0.670, 0.455, 0.192, 1),
        0.36,
        1.0,
    )
    jade = procedural_material(
        "InstrumentJade",
        (0.045, 0.130, 0.088, 1),
        (0.300, 0.720, 0.505, 1),
        0.18,
        0.0,
    )

    rings = [make_ring(f"ring_{index:02d}", radius, bronze) for index, radius in enumerate(RING_RADII, 1)]
    base = add_cylinder("instrument_base", jade, 0.55, 0.14)
    stand = add_torus("instrument_stand", bronze, 2.52, 0.034, 84, 12)
    stand.rotation_euler = (math.radians(78), 0, 0)
    stand.location = (0, -0.28, -0.28)

    root = bpy.data.objects.new("instrument_root", None)
    bpy.context.collection.objects.link(root)
    for obj in [*rings, base, stand]:
        obj.parent = root

    bronze_objects = [*rings, stand]
    for obj in bronze_objects:
        unwrap(obj)
    unwrap(base)
    configure_render()
    bake_material_maps("InstrumentBronze", bronze, bronze_objects, TEXTURE_SIZE, 1.0)
    bake_material_maps("InstrumentJade", jade, [base], TEXTURE_SIZE // 2, 0.0)

    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for obj in bpy.data.objects:
        if obj.parent == root:
            obj.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(OUTPUT_DIR, "instrument.gltf"),
        export_format="GLTF_SEPARATE",
        use_selection=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_yup=True,
    )
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)


if __name__ == "__main__":
    build_instrument()

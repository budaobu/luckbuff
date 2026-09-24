import math
import os

import bpy
import bmesh


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MODEL_DIR = os.path.dirname(__file__)
BLEND_PATH = os.path.join(MODEL_DIR, "jiaobei.blend")
PUBLIC_MODEL_DIR = os.path.join(PROJECT_ROOT, "public", "models", "jiaobei")
GLTF_PATH = os.path.join(PUBLIC_MODEL_DIR, "jiaobei.gltf")

OUTER_RADIUS = 1.15
INNER_RADIUS = 0.90
ARC_ANGLE = 0.82
THICKNESS = 0.15
SEGMENTS_ARC = 72
SEGMENTS_WIDTH = 18


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def crescent_points(t):
    angle = -ARC_ANGLE + t * ARC_ANGLE * 2
    inner_angle = math.asin(min(1.0, OUTER_RADIUS / INNER_RADIUS * math.sin(angle)))
    inner_offset = OUTER_RADIUS * math.cos(ARC_ANGLE) - INNER_RADIUS * math.cos(inner_angle)
    outer = (OUTER_RADIUS * math.cos(angle), OUTER_RADIUS * math.sin(angle))
    inner = (
        inner_offset + INNER_RADIUS * math.cos(inner_angle),
        INNER_RADIUS * math.sin(inner_angle),
    )
    return outer, inner


def create_cup_mesh(name):
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    rows = []
    for i in range(SEGMENTS_ARC + 1):
        t = i / SEGMENTS_ARC
        outer, inner = crescent_points(t)
        row = []
        for j in range(SEGMENTS_WIDTH + 1):
            u = j / SEGMENTS_WIDTH
            x = outer[0] * (1 - u) + inner[0] * u
            y = outer[1] * (1 - u) + inner[1] * u
            edge_fade = math.sin(math.pi * u) ** 0.7
            tip_fade = (math.sin(math.pi * t) ** 0.55)
            bulge = 0.23 * edge_fade * tip_fade
            row.append((x, y, bulge))
        rows.append(row)

    top_grid = [[bm.verts.new((x, y, THICKNESS * 0.5 + z)) for x, y, z in row] for row in rows]
    bottom_grid = [[bm.verts.new((x, y, -THICKNESS * 0.5)) for x, y, z in row] for row in rows]

    bm.verts.ensure_lookup_table()
    bm.verts.index_update()
    for i in range(SEGMENTS_ARC):
        for j in range(SEGMENTS_WIDTH):
            verts = (
                top_grid[i][j],
                top_grid[i + 1][j],
                top_grid[i + 1][j + 1],
                top_grid[i][j + 1],
            )
            if len({v.index for v in verts}) == 4:
                bm.faces.new(verts)

            verts = (
                bottom_grid[i][j],
                bottom_grid[i][j + 1],
                bottom_grid[i + 1][j + 1],
                bottom_grid[i + 1][j],
            )
            if len({v.index for v in verts}) == 4:
                bm.faces.new(verts)

    for i in range(SEGMENTS_ARC):
        quad = (
            bottom_grid[i][0],
            bottom_grid[i + 1][0],
            top_grid[i + 1][0],
            top_grid[i][0],
        )
        if len({v.index for v in quad}) == 4:
            bm.faces.new(quad)
        quad = (
            bottom_grid[i + 1][-1],
            bottom_grid[i][-1],
            top_grid[i][-1],
            top_grid[i + 1][-1],
        )
        if len({v.index for v in quad}) == 4:
            bm.faces.new(quad)

    bm.normal_update()
    uv_layer = bm.loops.layers.uv.new("UVMap") or bm.loops.layers.uv.verify()
    for face in bm.faces:
        for loop in face.loops:
            x, y, _ = loop.vert.co
            loop[uv_layer].uv = (
                0.05 + ((x - 0.78) / 0.44) * 0.90,
                0.10 + ((y + 0.90) / 1.80) * 0.80,
            )
    bm.to_mesh(mesh)
    bm.free()

    mesh.shade_smooth()
    return obj


def clear_nodes(material):
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()
    return nodes, links


def coordinate_chain(nodes, links, scale):
    texcoord = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = scale
    links.new(texcoord.outputs["Object"], mapping.inputs["Vector"])
    return mapping.outputs["Vector"]


def make_wood_nodes(material):
    nodes, links = clear_nodes(material)
    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    vector = coordinate_chain(nodes, links, (0.7, 5.5, 1.0))

    grain = nodes.new("ShaderNodeTexWave")
    grain.wave_type = "BANDS"
    grain.bands_direction = "X"
    grain.wave_profile = "SIN"
    grain.inputs["Scale"].default_value = 1.05
    grain.inputs["Distortion"].default_value = 9.0
    grain.inputs["Detail"].default_value = 5.0
    grain.inputs["Detail Scale"].default_value = 1.7
    links.new(vector, grain.inputs["Vector"])

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.152, 0.072, 0.031, 1.0)
    ramp.color_ramp.elements[1].color = (0.702, 0.474, 0.232, 1.0)
    middle = ramp.color_ramp.elements.new(0.48)
    middle.color = (0.458, 0.265, 0.112, 1.0)
    late = ramp.color_ramp.elements.new(0.78)
    late.color = (0.582, 0.368, 0.172, 1.0)
    links.new(grain.outputs["Color"], ramp.inputs["Fac"])

    bump_source = nodes.new("ShaderNodeTexNoise")
    bump_source.inputs["Scale"].default_value = 13.0
    bump_source.inputs["Detail"].default_value = 10.0
    links.new(vector, bump_source.inputs["Vector"])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.11
    bump.inputs["Distance"].default_value = 0.005
    links.new(bump_source.outputs["Fac"], bump.inputs["Height"])
    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_map.inputs["Strength"].default_value = 1.0
    links.new(bump.outputs["Normal"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], bsdf.inputs["Normal"])

    roughness_noise = nodes.new("ShaderNodeTexNoise")
    roughness_noise.inputs["Scale"].default_value = 7.0
    roughness_noise.inputs["Detail"].default_value = 7.0
    links.new(vector, roughness_noise.inputs["Vector"])
    roughness_ramp = nodes.new("ShaderNodeValToRGB")
    roughness_ramp.color_ramp.elements[0].position = 0.25
    roughness_ramp.color_ramp.elements[0].color = (0.44, 0.44, 0.44, 1.0)
    roughness_ramp.color_ramp.elements[1].position = 0.82
    roughness_ramp.color_ramp.elements[1].color = (0.72, 0.72, 0.72, 1.0)
    links.new(roughness_noise.outputs["Fac"], roughness_ramp.inputs["Fac"])
    links.new(roughness_ramp.outputs["Color"], bsdf.inputs["Roughness"])
    bsdf.inputs["Metallic"].default_value = 0.03

    return {
        "bsdf": bsdf,
        "base": ramp.outputs["Color"],
        "roughness": roughness_ramp.outputs["Color"],
        "normal": normal_map.outputs["Normal"],
        "output": output,
    }


def create_bake_image(name, non_color=False):
    image = bpy.data.images.new(name, 1024, 1024, alpha=False)
    image.colorspace_settings.name = "Non-Color" if non_color else "sRGB"
    image.generated_color = (0.5, 0.5, 0.5, 1.0) if non_color else (0.46, 0.28, 0.13, 1.0)
    return image


def bake_channel(nodes, links, surface, image, bake_type, pass_filter=set()):
    node = nodes.new("ShaderNodeTexImage")
    node.image = image
    nodes.active = node
    node.select = True
    if bake_type == "ROUGHNESS":
        target = surface["bsdf"].inputs["Roughness"]
        for link in list(target.links):
            links.remove(link)
        links.new(node.outputs["Color"], target)
    elif bake_type == "NORMAL":
        target = surface["bsdf"].inputs["Normal"]
        for link in list(target.links):
            links.remove(link)
        links.new(node.outputs["Color"], target)
    bpy.context.scene.render.engine = "CYCLES"
    bpy.context.scene.cycles.samples = 32
    bpy.context.scene.cycles.device = "CPU"
    bpy.ops.object.bake(type=bake_type, pass_filter=pass_filter, use_clear=True, margin=8)
    image.pack()


def bake_base_color(material, surface, image):
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    output = surface["output"]
    for link in list(output.inputs["Surface"].links):
        links.remove(link)

    emission = nodes.new("ShaderNodeEmission")
    links.new(surface["base"], emission.inputs["Color"])
    links.new(emission.outputs["Emission"], output.inputs["Surface"])
    bake_channel(nodes, links, surface, image, "EMIT")

    nodes.remove(emission)
    links.new(surface["bsdf"].outputs["BSDF"], output.inputs["Surface"])


def bake_material(material):
    surface = make_wood_nodes(material)
    albedo = create_bake_image("JiaobeiAlbedo")
    roughness = create_bake_image("JiaobeiRoughness", True)
    normal = create_bake_image("JiaobeiNormal", True)

    bake_base_color(material, surface, albedo)
    bake_channel(
        material.node_tree.nodes,
        material.node_tree.links,
        surface,
        roughness,
        "ROUGHNESS",
    )
    bake_channel(
        material.node_tree.nodes,
        material.node_tree.links,
        surface,
        normal,
        "NORMAL",
    )

    nodes, links = clear_nodes(material)
    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    normal_map = nodes.new("ShaderNodeNormalMap")
    uv_node = nodes.new("ShaderNodeUVMap")
    uv_node.uv_map = "UVMap"
    albedo_node = nodes.new("ShaderNodeTexImage")
    albedo_node.image = albedo
    roughness_node = nodes.new("ShaderNodeTexImage")
    roughness_node.image = roughness
    normal_node = nodes.new("ShaderNodeTexImage")
    normal_node.image = normal
    links.new(uv_node.outputs["UV"], albedo_node.inputs["Vector"])
    links.new(uv_node.outputs["UV"], roughness_node.inputs["Vector"])
    links.new(uv_node.outputs["UV"], normal_node.inputs["Vector"])
    links.new(albedo_node.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(roughness_node.outputs["Color"], bsdf.inputs["Roughness"])
    links.new(normal_node.outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], bsdf.inputs["Normal"])


def main():
    clear_scene()
    os.makedirs(PUBLIC_MODEL_DIR, exist_ok=True)
    cup = create_cup_mesh("JiaobeiCup")
    material = bpy.data.materials.new("JiaobeiWood")
    cup.data.materials.append(material)
    bpy.ops.object.select_all(action="DESELECT")
    cup.select_set(True)
    bpy.context.view_layer.objects.active = cup
    bake_material(material)

    cup_a = cup.copy()
    cup_a.name = "CupA"
    cup_a.location = (-0.8, 0, 0.25)
    bpy.context.collection.objects.link(cup_a)
    cup_b = cup.copy()
    cup_b.name = "CupB"
    cup_b.location = (0.8, 0, 0.25)
    cup_b.rotation_euler = (0, 0, math.radians(12))
    bpy.context.collection.objects.link(cup_b)

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    bpy.ops.export_scene.gltf(
        filepath=GLTF_PATH,
        export_format="GLTF_SEPARATE",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_texture_dir=PUBLIC_MODEL_DIR,
    )


if __name__ == "__main__":
    main()

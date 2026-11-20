import bpy
import math


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, color, roughness=0.66, metalness=0.02):
    item = bpy.data.materials.new(name)
    item.use_nodes = True
    bsdf = item.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metalness
    return item


def select_only(item):
    bpy.ops.object.select_all(action="DESELECT")
    item.select_set(True)
    bpy.context.view_layer.objects.active = item


def empty(name, location, parent=None):
    item = bpy.data.objects.new(name, None)
    item.empty_display_size = 0.08
    item.location = location
    bpy.context.collection.objects.link(item)
    if parent:
        item.parent = parent
        item.matrix_parent_inverse = parent.matrix_world.inverted()
    return item


def mesh(operator, name, location, item_material, parent=None, origin=None, **options):
    operator(location=location, **options)
    item = bpy.context.active_object
    item.name = name
    item.data.materials.append(item_material)
    if origin:
        select_only(item)
        bpy.context.scene.cursor.location = origin
        bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    if parent:
        item.parent = parent
        item.matrix_parent_inverse = parent.matrix_world.inverted()
    return item


def box(name, location, size, item_material, parent=None, rotation=(0, 0, 0), origin=None):
    return mesh(
        bpy.ops.mesh.primitive_cube_add,
        name,
        location,
        item_material,
        parent,
        origin,
        size=1.0,
        rotation=rotation,
    )


def set_dimensions(item, size):
    item.scale = size


def build_character():
    reset()
    skin = material("MonkSkin", (0.95, 0.82, 0.69), 0.46)
    robe = material("MonkRobe", (0.92, 0.93, 0.93), 0.72)
    sash = material("MonkSash", (0.96, 0.82, 0.43), 0.58)
    shoe = material("MonkShoe", (0.9, 0.91, 0.91), 0.65)
    dark = material("MonkDark", (0.18, 0.15, 0.13), 0.35)

    root = empty("MonkRoot", (0, 0, 0))
    hips = empty("Hips", (0, 0.62, 0), root)
    torso = empty("Torso", (0, 0.96, 0), hips)
    head = empty("Head", (0, 1.24, 0), torso)

    robe_mesh = mesh(
        bpy.ops.mesh.primitive_cone_add,
        "Robe",
        (0, 0.38, 0),
        robe,
        hips,
        (0, 0.62, 0),
        radius1=0.52,
        radius2=0.27,
        depth=0.78,
        vertices=24,
    )
    robe_mesh.rotation_euler = (0, 0, 0)

    torso_mesh = mesh(
        bpy.ops.mesh.primitive_cylinder_add,
        "TorsoMesh",
        (0, 1.06, 0),
        robe,
        torso,
        (0, 0.96, 0),
        radius=0.27,
        depth=0.52,
        vertices=24,
    )
    torso_mesh.rotation_euler = (0, 0, 0)

    sash_mesh = box(
        "Sash",
        (0.04, 1.04, 0.23),
        (0.22, 0.52, 0.06),
        sash,
        torso,
        (0.12, 0, 0.08),
        (0, 0.96, 0),
    )
    sash_mesh.rotation_euler = (0.12, 0, 0.08)

    head_mesh = mesh(
        bpy.ops.mesh.primitive_uv_sphere_add,
        "HeadMesh",
        (0, 1.40, 0),
        skin,
        head,
        (0, 1.24, 0),
        radius=0.30,
        segments=28,
        ring_count=20,
    )

    for side, name in ((-1, "Left"), (1, "Right")):
        eye = mesh(
            bpy.ops.mesh.primitive_uv_sphere_add,
            f"Eye{name}",
            (side * 0.11, 1.45, 0.25),
            dark,
            head,
            (0, 1.24, 0),
            radius=0.026,
            segments=10,
            ring_count=8,
        )
        eye.rotation_euler = (0, 0, 0)

    smile = mesh(
        bpy.ops.mesh.primitive_torus_add,
        "Smile",
        (0, 1.31, 0.24),
        dark,
        head,
        (0, 1.24, 0),
        major_radius=0.08,
        minor_radius=0.012,
        major_segments=16,
        minor_segments=6,
    )
    smile.rotation_euler = (math.radians(115), 0, math.pi)

    for side, name in ((-1, "Left"), (1, "Right")):
        shoulder = empty(f"Arm{name}", (side * 0.31, 1.12, 0), torso)
        mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"Arm{name}Mesh",
            (side * 0.36, 0.85, 0),
            robe,
            shoulder,
            (side * 0.31, 1.12, 0),
            radius=0.068,
            depth=0.52,
            vertices=14,
            rotation=(0, 0, side * 0.06),
        )
        mesh(
            bpy.ops.mesh.primitive_cone_add,
            f"Sleeve{name}",
            (side * 0.38, 0.82, 0),
            robe,
            shoulder,
            (side * 0.31, 1.12, 0),
            radius1=0.09,
            radius2=0.15,
            depth=0.24,
            vertices=14,
            rotation=(math.pi, 0, side * 0.06),
        )

    for side, name in ((-1, "Left"), (1, "Right")):
        leg = empty(f"Leg{name}", (side * 0.13, 0.62, 0), hips)
        mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"Leg{name}Mesh",
            (side * 0.13, 0.38, 0),
            robe,
            leg,
            (side * 0.13, 0.62, 0),
            radius=0.08,
            depth=0.46,
            vertices=12,
        )
        mesh(
            bpy.ops.mesh.primitive_uv_sphere_add,
            f"Shoe{name}",
            (side * 0.13, 0.08, 0.05),
            shoe,
            leg,
            (side * 0.13, 0.62, 0),
            radius=0.085,
            segments=14,
            ring_count=10,
        )

    bpy.ops.export_scene.gltf(
        filepath="/Users/clawkid/WorkBuddy/luckbuff/public/sansatemple/monk.glb",
        export_format="GLB",
        export_yup=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
    )


def static_materials():
    return {
        "wood": material("Wood", (0.36, 0.23, 0.15), 0.62),
        "wood_light": material("WoodLight", (0.58, 0.42, 0.27), 0.66),
        "roof": material("Roof", (0.21, 0.22, 0.25), 0.43),
        "stone": material("Stone", (0.63, 0.63, 0.64), 0.72),
        "plaster": material("Plaster", (0.86, 0.81, 0.69), 0.78),
        "leaf_red": material("LeafRed", (0.75, 0.28, 0.14), 0.78),
        "leaf_orange": material("LeafOrange", (0.85, 0.48, 0.16), 0.78),
        "leaf_gold": material("LeafGold", (0.89, 0.65, 0.24), 0.78),
        "leaf_green": material("LeafGreen", (0.35, 0.52, 0.28), 0.78),
        "water": material("Water", (0.29, 0.56, 0.71), 0.22, 0.04),
        "gold": material("Gold", (0.91, 0.74, 0.41), 0.32, 0.32),
        "cloth": material("Cloth", (0.94, 0.91, 0.84), 0.76),
        "persimmon": material("Persimmon", (0.91, 0.45, 0.18), 0.58),
    }


def asset_root(name):
    return empty(name, (0, 0, 0))


def build_static():
    reset()
    mats = static_materials()

    gate = asset_root("TempleGate")
    for side in (-1, 1):
        column = mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"GateColumn{side}",
            (side * 2.2, 1.8, 0),
            mats["wood"],
            gate,
            radius=0.22,
            depth=3.6,
            vertices=18,
        )
        column.rotation_euler = (0, 0, 0)
    beam = box("GateBeam", (0, 3.35, 0), (5.6, 0.34, 0.8), mats["wood"], gate)
    set_dimensions(beam, (1, 1, 1))
    roof = mesh(
        bpy.ops.mesh.primitive_cone_add,
        "GateRoof",
        (0, 4.05, 0),
        mats["roof"],
        gate,
        radius1=4.0,
        radius2=0.4,
        depth=1.0,
        vertices=4,
    )
    roof.rotation_euler = (0, math.pi / 4, 0)
    roof.scale = (1.8, 1, 0.75)
    plaque = box("GatePlaque", (0, 3.32, -0.42), (1.5, 0.42, 0.08), mats["cloth"], gate)
    set_dimensions(plaque, (1, 1, 1))

    hall = asset_root("MainHall")
    platform = box("HallPlatform", (0, 0.18, 0), (16, 0.36, 11), mats["stone"], hall)
    set_dimensions(platform, (1, 1, 1))
    floor = box("HallFloor", (0, 0.48, 0), (14.5, 0.22, 9.4), mats["wood_light"], hall)
    set_dimensions(floor, (1, 1, 1))
    for row, count in ((-3.2, 7), (3.2, 7)):
        for index in range(count):
            x = -5.4 + index * 1.8
            column = mesh(
                bpy.ops.mesh.primitive_cylinder_add,
                f"HallColumn{row}_{index}",
                (x, 2.0, row),
                mats["wood"],
                hall,
                radius=0.24,
                depth=3.1,
                vertices=16,
            )
            column.rotation_euler = (0, 0, 0)
    for index in range(4):
        x = -3.9 + index * 2.6
        panel = box(f"HallLattice{index}", (x, 1.9, 3.2), (1.7, 1.9, 0.09), mats["plaster"], hall)
        set_dimensions(panel, (1, 1, 1))
    eave = box("HallEave", (0, 3.7, 0), (16.5, 0.24, 12), mats["roof"], hall)
    set_dimensions(eave, (1, 1, 1))
    roof = mesh(
        bpy.ops.mesh.primitive_cone_add,
        "HallRoof",
        (0, 4.45, 0),
        mats["roof"],
        hall,
        radius1=8.7,
        radius2=5.8,
        depth=1.15,
        vertices=4,
    )
    roof.rotation_euler = (0, math.pi / 4, 0)
    roof.scale = (1.5, 1, 0.64)
    ridge = box("HallRidge", (0, 5.1, 0), (8.2, 0.24, 0.5), mats["roof"], hall)
    set_dimensions(ridge, (1, 1, 1))
    buddha = mesh(
        bpy.ops.mesh.primitive_uv_sphere_add,
        "HallBuddha",
        (0, 1.55, -2.2),
        mats["gold"],
        hall,
        radius=0.82,
        segments=28,
        ring_count=20,
    )
    buddha.scale = (1, 1.35, 0.9)

    pagoda = asset_root("Pagoda")
    for tier in range(5):
        width = 2.8 - tier * 0.36
        body = mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"PagodaBody{tier}",
            (0, 0.8 + tier * 1.25, 0),
            mats["stone"],
            pagoda,
            radius=width * 0.42,
            depth=1.0,
            vertices=12,
        )
        body.rotation_euler = (0, 0, 0)
        eave = mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"PagodaEave{tier}",
            (0, 1.38 + tier * 1.25, 0),
            mats["roof"],
            pagoda,
            radius=width * 0.68,
            depth=0.12,
            vertices=12,
        )
        eave.rotation_euler = (0, 0, 0)
    tip = mesh(
        bpy.ops.mesh.primitive_cone_add,
        "PagodaTip",
        (0, 7.5, 0),
        mats["gold"],
        pagoda,
        radius1=0.08,
        radius2=0.22,
        depth=0.75,
        vertices=10,
    )
    tip.rotation_euler = (0, 0, 0)

    lantern = asset_root("StoneLantern")
    base = box("LanternBase", (0, 0.1, 0), (0.55, 0.2, 0.55), mats["stone"], lantern)
    set_dimensions(base, (1, 1, 1))
    post = box("LanternPost", (0, 0.55, 0), (0.18, 0.7, 0.18), mats["stone"], lantern)
    set_dimensions(post, (1, 1, 1))
    house = box("LanternHouse", (0, 1.1, 0), (0.52, 0.44, 0.52), mats["plaster"], lantern)
    set_dimensions(house, (1, 1, 1))
    cap = mesh(
        bpy.ops.mesh.primitive_cone_add,
        "LanternCap",
        (0, 1.52, 0),
        mats["stone"],
        lantern,
        radius1=0.02,
        radius2=0.44,
        depth=0.28,
        vertices=4,
    )
    cap.rotation_euler = (0, math.pi / 4, 0)

    tree = asset_root("AutumnTree")
    trunk = mesh(
        bpy.ops.mesh.primitive_cylinder_add,
        "TreeTrunk",
        (0, 0.9, 0),
        mats["wood"],
        tree,
        radius=0.13,
        depth=1.8,
        vertices=10,
    )
    trunk.rotation_euler = (0, 0, 0)
    for index, (x, y, z, radius, item_material) in enumerate((
        (-0.35, 2.1, 0.1, 0.78, mats["leaf_red"]),
        (0.25, 2.45, -0.18, 0.9, mats["leaf_orange"]),
        (0.05, 2.9, 0.25, 0.66, mats["leaf_gold"]),
        (-0.1, 2.3, -0.35, 0.52, mats["leaf_red"]),
    )):
        crown = mesh(
            bpy.ops.mesh.primitive_ico_sphere_add,
            f"TreeCrown{index}",
            (x, y, z),
            item_material,
            tree,
            radius=radius,
            subdivisions=1,
        )
        crown.rotation_euler = (index * 0.6, index * 0.8, index * 0.4)

    bench = asset_root("Bench")
    seat = box("BenchSeat", (0, 0.52, 0), (1.6, 0.1, 0.48), mats["wood"], bench)
    set_dimensions(seat, (1, 1, 1))
    for side in (-1, 1):
        leg = box(f"BenchLeg{side}", (side * 0.62, 0.25, 0), (0.09, 0.5, 0.09), mats["wood"], bench)
        set_dimensions(leg, (1, 1, 1))

    pavilion = asset_root("BellPavilion")
    for x, z in ((-1.1, -1.1), (1.1, -1.1), (-1.1, 1.1), (1.1, 1.1)):
        column = mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"BellColumn{x}_{z}",
            (x, 1.35, z),
            mats["wood"],
            pavilion,
            radius=0.12,
            depth=2.7,
            vertices=12,
        )
        column.rotation_euler = (0, 0, 0)
    roof = mesh(
        bpy.ops.mesh.primitive_cylinder_add,
        "BellRoof",
        (0, 2.95, 0),
        mats["roof"],
        pavilion,
        radius=1.5,
        depth=0.45,
        vertices=4,
    )
    roof.rotation_euler = (0, math.pi / 4, 0)
    roof.scale = (1.33, 1, 1)
    bell = mesh(
        bpy.ops.mesh.primitive_cylinder_add,
        "BellBody",
        (0, 1.55, 0),
        mats["gold"],
        pavilion,
        radius=0.65,
        depth=0.95,
        vertices=20,
    )
    bell.rotation_euler = (0, 0, 0)
    bell.scale = (0.9, 1, 1)

    canopy = asset_root("TeaCanopy")
    roof = box("CanopyRoof", (0, 2.5, 0), (4.4, 0.14, 3.6), mats["cloth"], canopy)
    set_dimensions(roof, (1, 1, 1))
    for x, z in ((-1.7, -1.4), (1.7, -1.4), (-1.7, 1.4), (1.7, 1.4)):
        post = mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"CanopyPost{x}_{z}",
            (x, 1.25, z),
            mats["wood"],
            canopy,
            radius=0.06,
            depth=2.5,
            vertices=10,
        )
        post.rotation_euler = (0, 0, 0)
    for x in (-1.0, 1.0):
        table = mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"TeaTable{x}",
            (x, 0.68, 0),
            mats["wood"],
            canopy,
            radius=0.42,
            depth=0.08,
            vertices=18,
        )
        table.rotation_euler = (0, 0, 0)
        stem = mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"TeaStem{x}",
            (x, 0.34, 0),
            mats["wood"],
            canopy,
            radius=0.05,
            depth=0.6,
            vertices=8,
        )
        stem.rotation_euler = (0, 0, 0)

    bamboo = asset_root("BambooCluster")
    for index in range(16):
        angle = index / 16 * math.tau
        radius = 0.2 + (index % 4) * 0.28
        stem = mesh(
            bpy.ops.mesh.primitive_cylinder_add,
            f"BambooStem{index}",
            (math.cos(angle) * radius, 1.9, math.sin(angle) * radius),
            mats["leaf_green"],
            bamboo,
            radius=0.05,
            depth=3.8,
            vertices=6,
        )
        stem.rotation_euler = (0.03, index * 0.5, 0.02)

    rack = asset_root("PersimmonRack")
    for z in (-1.6, 0, 1.6):
        beam = box(f"RackBeam{z}", (0, 1.7, z), (4.2, 0.1, 0.09), mats["wood"], rack)
        set_dimensions(beam, (1, 1, 1))
    for side in (-1, 1):
        post = box(f"RackPost{side}", (side * 1.9, 0.85, 0), (0.1, 1.7, 0.1), mats["wood"], rack)
        set_dimensions(post, (1, 1, 1))
    for index in range(24):
        angle = index * 1.1
        fruit = mesh(
            bpy.ops.mesh.primitive_uv_sphere_add,
            f"Persimmon{index}",
            (-1.7 + (index % 8) * 0.48, 1.82 + (index % 3) * 0.08, -1.6 + (index // 8) * 1.6),
            mats["persimmon"],
            rack,
            radius=0.11,
            segments=12,
            ring_count=8,
        )
        fruit.rotation_euler = (angle, angle * 0.4, 0)

    workshop = asset_root("Workshop")
    for x in (-1.2, 1.2):
        frame = box(f"WorkshopFrame{x}", (x, 1.4, -0.8), (0.14, 2.8, 0.14), mats["wood"], workshop)
        set_dimensions(frame, (1, 1, 1))
    brace = box("WorkshopBrace", (0, 2.7, -0.8), (2.8, 0.13, 0.13), mats["wood"], workshop)
    set_dimensions(brace, (1, 1, 1))
    for index in range(20):
        tile = box(
            f"RoofTile{index}",
            (-0.55 + (index % 5) * 0.28, 0.22 + (index // 5) * 0.13, -0.55 + (index % 3) * 0.32),
            (0.42, 0.09, 0.58),
            mats["roof"],
            workshop,
        )
        set_dimensions(tile, (1, 1, 1))
    table = box("WorkshopTable", (0.8, 0.55, 0.8), (1.3, 0.1, 0.7), mats["wood_light"], workshop)
    set_dimensions(table, (1, 1, 1))

    bridge = asset_root("RiverBridge")
    deck = box("BridgeDeck", (0, 0.58, 0), (1.8, 0.14, 6), mats["wood"], bridge)
    set_dimensions(deck, (1, 1, 1))
    for x, z in ((-0.7, -2.2), (0.7, -2.2), (-0.7, 2.2), (0.7, 2.2)):
        pier = box(f"BridgePier{x}_{z}", (x, 0.28, z), (0.14, 0.56, 0.14), mats["stone"], bridge)
        set_dimensions(pier, (1, 1, 1))
    rail = mesh(
        bpy.ops.mesh.primitive_torus_add,
        "BridgeRail",
        (0, 0.85, 0),
        mats["wood"],
        bridge,
        major_radius=2.8,
        minor_radius=0.035,
        major_segments=28,
        minor_segments=6,
    )
    rail.rotation_euler = (math.pi / 2, 0, 0)
    rail.scale = (0.35, 1, 1)

    bpy.ops.export_scene.gltf(
        filepath="/Users/clawkid/WorkBuddy/luckbuff/public/sansatemple/temple-library.glb",
        export_format="GLB",
        export_yup=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
    )


build_character()
build_static()

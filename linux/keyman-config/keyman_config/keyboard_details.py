#!/usr/bin/python3

# Keyboard details window

import json
import logging
import os.path
import qrcode

import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk

from keyman_config.accelerators import bind_accelerator, init_accel
from keyman_config.get_kmp import get_keyboard_data
from keyman_config.kmpmetadata import parsemetadata

# basics: keyboard name, package version, description
# other things: filename (of kmx), ,
#    OSK availability, documentation availability, package copyright
# also: supported languages, fonts
# from kmx?: keyboard version, encoding, layout type

# there is data in kmp.inf/kmp.json
# there is possibly data in kbid.json (downloaded from api)

class KeyboardDetailsView(Gtk.Window):
    # TODO Display all the information that is available
    #    especially what is displayed for Keyman on Windows
    # TODO clean up file once have what we want
    def __init__(self, kmp):
        #kmp has name, version, packageID, area
        if "keyboard" in kmp["name"].lower():
            wintitle = kmp["name"]
        else:
            wintitle = kmp["name"] + " keyboard"
        Gtk.Window.__init__(self, title=wintitle)
        init_accel(self)

        vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=12)

        packageDir = os.path.join(kmp['areapath'], kmp['packageID'])
        kmp_json = os.path.join(packageDir, "kmp.json")
        info, system, options, keyboards, files = parsemetadata(kmp_json)

        if (info == None):
            raise Exception("could not parse kmp.json", kmp['packageID'], packageDir, kmp_json)

        kbdata = None
        jsonfile = os.path.join(packageDir, kmp['packageID'] + ".json")
        if os.path.isfile(jsonfile):
            with open(jsonfile, "r") as read_file:
                kbdata = json.load(read_file)

        box = Gtk.Box(spacing=10)
        #self.add(box)
        grid = Gtk.Grid()
        #grid.set_column_homogeneous(True)

        box.add(grid)
        #self.add(grid)

        # kbdatapath = os.path.join("/usr/local/share/keyman", kmp["id"], kmp["id"] + ".json")

        # Package info

        lbl_pkg_name = Gtk.Label()
        lbl_pkg_name.set_text("Package name:   ")
        lbl_pkg_name.set_halign(Gtk.Align.END)
        grid.add(lbl_pkg_name)
        prevlabel = lbl_pkg_name
        label = Gtk.Label()
        label.set_text(info['name']['description'])
        label.set_halign(Gtk.Align.START)
        label.set_selectable(True)
        grid.attach_next_to(label, lbl_pkg_name, Gtk.PositionType.RIGHT, 1, 1)

        lbl_pkg_id = Gtk.Label()
        lbl_pkg_id.set_text("Package id:   ")
        lbl_pkg_id.set_halign(Gtk.Align.END)
        grid.attach_next_to(lbl_pkg_id, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
        prevlabel = lbl_pkg_id
        label = Gtk.Label()
        label.set_text(kmp['packageID'])
        label.set_halign(Gtk.Align.START)
        label.set_selectable(True)
        grid.attach_next_to(label, lbl_pkg_id, Gtk.PositionType.RIGHT, 1, 1)

        lbl_pkg_vrs = Gtk.Label()
        lbl_pkg_vrs.set_text("Package version:   ")
        lbl_pkg_vrs.set_halign(Gtk.Align.END)
        grid.attach_next_to(lbl_pkg_vrs, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
        prevlabel = lbl_pkg_vrs
        label = Gtk.Label()
        label.set_text(info['version']['description'])
        label.set_halign(Gtk.Align.START)
        label.set_selectable(True)
        grid.attach_next_to(label, lbl_pkg_vrs, Gtk.PositionType.RIGHT, 1, 1)

        if kbdata:
            lbl_pkg_desc = Gtk.Label()
            lbl_pkg_desc.set_text("Package description:   ")
            lbl_pkg_desc.set_halign(Gtk.Align.END)
            grid.attach_next_to(lbl_pkg_desc, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
            prevlabel = lbl_pkg_desc
            label = Gtk.Label()
            label.set_text(kbdata['description'])
            label.set_halign(Gtk.Align.START)
            label.set_selectable(True)
            label.set_line_wrap(80)
            grid.attach_next_to(label, lbl_pkg_desc, Gtk.PositionType.RIGHT, 1, 1)

        if "author" in info:
            lbl_pkg_auth = Gtk.Label()
            lbl_pkg_auth.set_text("Package author:   ")
            lbl_pkg_auth.set_halign(Gtk.Align.END)
            grid.attach_next_to(lbl_pkg_auth, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
            prevlabel = lbl_pkg_auth
            label = Gtk.Label()
            label.set_text(info['author']['description'])
            label.set_halign(Gtk.Align.START)
            label.set_selectable(True)
            grid.attach_next_to(label, lbl_pkg_auth, Gtk.PositionType.RIGHT, 1, 1)

        if "copyright" in info:
            lbl_pkg_cpy = Gtk.Label()
            lbl_pkg_cpy.set_text("Package copyright:   ")
            lbl_pkg_cpy.set_halign(Gtk.Align.END)
            grid.attach_next_to(lbl_pkg_cpy, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
            prevlabel = lbl_pkg_cpy
            label = Gtk.Label()
            label.set_text(info['copyright']['description'])
            label.set_halign(Gtk.Align.START)
            label.set_selectable(True)
            grid.attach_next_to(label, lbl_pkg_cpy, Gtk.PositionType.RIGHT, 1, 1)

        # Padding and full width horizontal divider
        lbl_pad = Gtk.Label()
        lbl_pad.set_text("")
        lbl_pad.set_halign(Gtk.Align.END)
        grid.attach_next_to(lbl_pad, prevlabel, Gtk.PositionType.BOTTOM, 2, 1)
        prevlabel = lbl_pad

        divider_pkg = Gtk.HSeparator()
        grid.attach_next_to(divider_pkg, prevlabel, Gtk.PositionType.BOTTOM, 2, 1)


        # Keyboard info for each keyboard

        if keyboards:
            for kbd in keyboards:
                kbdata = None
                jsonfile = os.path.join(packageDir, kbd['id'] + ".json")
                if os.path.isfile(jsonfile):
                    with open(jsonfile, "r") as read_file:
                        kbdata = json.load(read_file)

                # show the icon somewhere

                lbl_kbd_file = Gtk.Label()
                lbl_kbd_file.set_text("Keyboard filename:   ")
                lbl_kbd_file.set_halign(Gtk.Align.END)
                grid.attach_next_to(lbl_kbd_file, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                prevlabel = lbl_kbd_file
                label = Gtk.Label()
                label.set_text(os.path.join(packageDir, kbd['id'] + ".kmx"))
                label.set_halign(Gtk.Align.START)
                label.set_selectable(True)
                grid.attach_next_to(label, lbl_kbd_file, Gtk.PositionType.RIGHT, 1, 1)

                if kbdata:
                    if kbdata['id'] != kmp['packageID']:
                        lbl_kbd_name = Gtk.Label()
                        lbl_kbd_name.set_text("Keyboard name:   ")
                        lbl_kbd_name.set_halign(Gtk.Align.END)
                        grid.attach_next_to(lbl_kbd_name, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                        prevlabel = lbl_kbd_name
                        label = Gtk.Label()
                        label.set_text(kbdata['name'])
                        label.set_halign(Gtk.Align.START)
                        label.set_selectable(True)
                        grid.attach_next_to(label, lbl_kbd_name, Gtk.PositionType.RIGHT, 1, 1)

                        lbl_kbd_id = Gtk.Label()
                        lbl_kbd_id.set_text("Keyboard id:   ")
                        lbl_kbd_id.set_halign(Gtk.Align.END)
                        grid.attach_next_to(lbl_kbd_id, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                        prevlabel = lbl_kbd_id
                        label = Gtk.Label()
                        label.set_text(kbdata['id'])
                        label.set_halign(Gtk.Align.START)
                        label.set_selectable(True)
                        grid.attach_next_to(label, lbl_kbd_id, Gtk.PositionType.RIGHT, 1, 1)

                        lbl_kbd_vrs = Gtk.Label()
                        lbl_kbd_vrs.set_text("Keyboard version:   ")
                        lbl_kbd_vrs.set_halign(Gtk.Align.END)
                        grid.attach_next_to(lbl_kbd_vrs, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                        prevlabel = lbl_kbd_vrs
                        label = Gtk.Label()
                        label.set_text(kbdata['version'])
                        label.set_halign(Gtk.Align.START)
                        label.set_selectable(True)
                        grid.attach_next_to(label, lbl_kbd_vrs, Gtk.PositionType.RIGHT, 1, 1)

                        if "author" in info:
                            lbl_kbd_auth = Gtk.Label()
                            lbl_kbd_auth.set_text("Keyboard author:   ")
                            lbl_kbd_auth.set_halign(Gtk.Align.END)
                            grid.attach_next_to(lbl_kbd_auth, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                            prevlabel = lbl_kbd_auth
                            label = Gtk.Label()
                            label.set_text(kbdata['authorName'])
                            label.set_halign(Gtk.Align.START)
                            label.set_selectable(True)
                            grid.attach_next_to(label, lbl_kbd_auth, Gtk.PositionType.RIGHT, 1, 1)

                        lbl_kbd_lic = Gtk.Label()
                        lbl_kbd_lic.set_text("Keyboard license:   ")
                        lbl_kbd_lic.set_halign(Gtk.Align.END)
                        grid.attach_next_to(lbl_kbd_lic, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                        prevlabel = lbl_kbd_lic
                        label = Gtk.Label()
                        label.set_text(kbdata['license'])
                        label.set_halign(Gtk.Align.START)
                        label.set_selectable(True)
                        grid.attach_next_to(label, lbl_kbd_lic, Gtk.PositionType.RIGHT, 1, 1)

                        lbl_kbd_desc = Gtk.Label()
                        lbl_kbd_desc.set_text("Keyboard description:   ")
                        lbl_kbd_desc.set_halign(Gtk.Align.END)
                        grid.attach_next_to(lbl_kbd_desc, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                        prevlabel = lbl_kbd_desc
                        label = Gtk.Label()
                        label.set_text(kbdata['description'])
                        label.set_halign(Gtk.Align.START)
                        label.set_selectable(True)
                        label.set_line_wrap(80)
                        grid.attach_next_to(label, lbl_kbd_desc, Gtk.PositionType.RIGHT, 1, 1)

                        # Padding and full width horizontal divider
                        lbl_pad = Gtk.Label()
                        lbl_pad.set_text("")
                        lbl_pad.set_halign(Gtk.Align.END)
                        grid.attach_next_to(lbl_pad, prevlabel, Gtk.PositionType.BOTTOM, 2, 1)
                        prevlabel = lbl_pad

                        divider_pkg = Gtk.HSeparator()
                        grid.attach_next_to(divider_pkg, prevlabel, Gtk.PositionType.BOTTOM, 2, 1)

                        # label7 = Gtk.Label()
                        # label7.set_text("On Screen Keyboard:   ")
                        # label7.set_halign(Gtk.Align.END)
                        # grid.attach_next_to(label7, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                        # prevlabel = label7
                        # # label = Gtk.Label()
                        # # label.set_text(info['version']['description'])
                        # # label.set_halign(Gtk.Align.START)
                        # # label.set_selectable(True)
                        # # grid.attach_next_to(label, label7, Gtk.PositionType.RIGHT, 1, 1)

                        # label8 = Gtk.Label()
                        # label8.set_text("Documentation:   ")
                        # label8.set_halign(Gtk.Align.END)
                        # grid.attach_next_to(label8, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                        # prevlabel = label8
                        # #TODO need to know which area keyboard is installed in to show this
                        # # label = Gtk.Label()
                        # # welcome_file = os.path.join("/usr/local/share/doc/keyman", kmp["id"], "welcome.htm")
                        # # if os.path.isfile(welcome_file):
                        # #     label.set_text("Installed")
                        # # else:
                        # #     label.set_text("Not installed")
                        # # label.set_halign(Gtk.Align.START)
                        # # label.set_selectable(True)
                        # # grid.attach_next_to(label, label8, Gtk.PositionType.RIGHT, 1, 1)

                        # label9 = Gtk.Label()
                        # # stored in kmx
                        # label9.set_text("Message:   ")
                        # label9.set_halign(Gtk.Align.END)
                        # grid.attach_next_to(label9, prevlabel, Gtk.PositionType.BOTTOM, 1, 1)
                        # prevlabel = label9
                        # label = Gtk.Label()
                        # label.set_line_wrap(True)
                        # label.set_text("This keyboard is distributed under the MIT license (MIT) as described somewhere")
                        # #label.set_text(kmp["description"])
                        # label.set_halign(Gtk.Align.START)
                        # label.set_selectable(True)
                        # grid.attach_next_to(label, label9, Gtk.PositionType.RIGHT, 1, 1)
        vbox.pack_start(box, True, True, 0)

        hbox = Gtk.Box(spacing=6)
        vbox.pack_start(hbox, False, False, 0)

        # Add an entire row of padding
        lbl_pad = Gtk.Label()
        lbl_pad.set_text("")
        lbl_pad.set_halign(Gtk.Align.END)
        grid.attach_next_to(lbl_pad, prevlabel, Gtk.PositionType.BOTTOM, 2, 1)
        prevlabel = lbl_pad

        # If it doesn't exist, generate QR code to share keyboard package
        path_qr = packageDir + "/qrcode.png"
        if not os.path.isfile(path_qr):
            qr = qrcode.QRCode(
                 version = 1,
                 error_correction = qrcode.constants.ERROR_CORRECT_H,
                 box_size = 4,
                 border = 4)
            url = "https://keyman.com/go/keyboard/" + kmp['packageID'] + "/share"
            qr.add_data(url)
            qr.make(fit=True)

            img = qr.make_image()
            img.save(path_qr)

        # Display QR Code, spanning 2 columns so it will be centered
        image = Gtk.Image()
        image.set_from_file(path_qr)
        grid.attach_next_to(image, prevlabel, Gtk.PositionType.BOTTOM, 2, 1)

        lbl_share_kbd = Gtk.Label()
        lbl_share_kbd.set_text("Scan this code to load this keyboard\n"
                               "on another device or share online")
        lbl_share_kbd.set_halign(Gtk.Align.CENTER)
        lbl_share_kbd.set_line_wrap(True)
        grid.attach_next_to(lbl_share_kbd, image, Gtk.PositionType.BOTTOM, 2, 1)
        prevlabel = lbl_share_kbd

        button = Gtk.Button.new_with_mnemonic("_Close")
        button.set_tooltip_text("Close window")
        button.connect("clicked", self.on_close_clicked)

        hbox.pack_end(button, False, False, 0)
        bind_accelerator(self.accelerators, button, '<Control>w')

        self.add(vbox)
        self.resize(635, 270)

    def on_close_clicked(self, button):
        logging.debug("Closing keyboard details window")
        self.close()

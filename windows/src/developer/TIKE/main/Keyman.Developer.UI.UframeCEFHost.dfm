inherited frameCEFHost: TframeCEFHost
  Left = 193
  Top = 131
  ActiveControl = cef
  Align = alClient
  BorderIcons = []
  BorderStyle = bsNone
  Caption = ''
  ClientHeight = 645
  ClientWidth = 878
  OldCreateOrder = True
  OnDestroy = FormDestroy
  ExplicitWidth = 878
  ExplicitHeight = 645
  PixelsPerInch = 96
  TextHeight = 13
  object cef: TChromiumWindow
    Left = 0
    Top = 0
    Width = 878
    Height = 645
    Align = alClient
    TabOrder = 0
    OnClose = cefClose
    OnAfterCreated = cefAfterCreated
  end
  object tmrRefresh: TTimer
    Enabled = False
    Left = 604
    Top = 48
  end
  object tmrCreateBrowser: TTimer
    Enabled = False
    Interval = 300
    OnTimer = tmrCreateBrowserTimer
    Left = 620
    Top = 208
  end
end
